/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  GeolocusMultiPolygonObject,
  GeolocusPolygonObject,
  TGeolocusObject,
  createEmptyGeolocusObject,
  createPolygonFromBBox,
} from '@/object'
import {
  Direction,
  Distance,
  IGeoRelation,
  TAbsoluteDirection,
  TEuclideanDistance,
  TEuclideanDistanceRange,
  TIsInsideTag,
  TRelativeDirection,
  TTopologyRelation,
  Topology,
} from '@/relation'
import { Compare, GEO_MAX_VALUE, Vector2 } from '@/util'
import { IRegionHandlerResult, IRegionPDF, TRegionRegion } from './region.type'

export class RegionResultHandler {
  private static intersection = (
    object0: TGeolocusObject,
    object1: TGeolocusObject,
  ) => {
    let intersection = Topology.intersection(object0, object1)
    if (!intersection) {
      intersection = createEmptyGeolocusObject('Polygon')
    }
    return intersection as TRegionRegion
  }

  private static equalHandler = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
  ): IRegionHandlerResult => {
    const region = Topology.bufferOfDistance(origin, 0.005)!
    const pdf: IRegionPDF = {
      type: 'constant',
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: false }
  }

  private static containHandler = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
  ): IRegionHandlerResult => {
    const region = Topology.bufferOfDistance(origin, 0.005)!
    const pdf: IRegionPDF = {
      type: 'sdf',
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: region,
        girdNum: relation.context.getResultGirdNum(),
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: false }
  }

  private static intersectHandler = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    target: TGeolocusObject,
  ): IRegionHandlerResult => {
    const originBBox = origin.getBBox()
    const originLength =
      Vector2.distanceTo(
        [originBBox[0], originBBox[1]],
        [originBBox[2], originBBox[3]],
      ) * 0.005
    const targetBBox = target.getBBox()
    let targetLength = Vector2.distanceTo(
      [targetBBox[0], targetBBox[1]],
      [targetBBox[2], targetBBox[3]],
    )
    if (Compare.LE(targetLength, 0.005)) targetLength = 0.005
    if (Compare.LE(targetLength, originLength)) targetLength = originLength
    const objectType = origin.getType()
    let region: TRegionRegion
    if (objectType === 'Point' || objectType === 'LineString') {
      region = Topology.bufferOfDistance(origin, targetLength)!
    } else {
      let temp = Topology.bufferOfRange(origin, [-targetLength, targetLength])
      if (!temp) {
        temp = Topology.bufferOfDistance(origin, targetLength)!
      }
      region = temp
    }
    const pdf: IRegionPDF = {
      type: 'sdf',
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: region,
        girdNum: relation.context.getResultGirdNum(),
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  private static disjointHandler = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
  ): IRegionHandlerResult => {
    const buffer = Topology.bufferOfDistance(origin, 0.005)!
    const region = Topology.difference(
      createPolygonFromBBox([
        -GEO_MAX_VALUE,
        -GEO_MAX_VALUE,
        GEO_MAX_VALUE,
        GEO_MAX_VALUE,
      ]),
      buffer,
    ) as GeolocusPolygonObject
    const pdf: IRegionPDF = {
      type: 'constant',
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: true }
  }

  static topology = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    target: TGeolocusObject,
  ): IRegionHandlerResult => {
    const topology = relation.topology as TTopologyRelation
    const map = {
      equal: this.equalHandler,
      contain: this.containHandler,
      intersect: this.intersectHandler,
      disjoint: this.disjointHandler,
    }
    const result = map[topology](origin, relation, target)

    return result
  }

  static distance = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    _: TGeolocusObject,
    tag: TIsInsideTag = 'outside',
  ): IRegionHandlerResult => {
    const context = relation.context
    const distance = Distance.normalize(
      relation.distance as TEuclideanDistance | TEuclideanDistanceRange,
    )
    const meanDistanceDelta = context.getDistanceDelta() * distance.mean
    const minDistance =
      distance.min - meanDistanceDelta * 1.5 < 0
        ? 0
        : distance.min - meanDistanceDelta * 1.5
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3
    let region = Distance.computeRegionAwayFromObject(
      origin,
      [minDistance, maxDistance],
      tag,
    )
    if (!region) {
      region = createEmptyGeolocusObject('Polygon')
    }
    const pdf: IRegionPDF = {
      type: 'distance',
      origin,
      gdf: {
        distance: distance.mean,
        distanceDelta,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  static direction = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    _: TGeolocusObject,
    tag: TIsInsideTag = 'outside',
  ): IRegionHandlerResult => {
    const context = relation.context
    const direction = relation.direction as
      | TAbsoluteDirection
      | TRelativeDirection
    const directionDelta = context.getDirectionDelta(direction)
    const region = Direction.computeRegion(origin, direction, tag, context)
    const pdf: IRegionPDF = {
      type: 'angle',
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: directionDelta[0],
        azimuthDelta: directionDelta[1],
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: true }
  }

  static directionAndDistance = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
  ): IRegionHandlerResult => {
    const context = relation.context
    const direction = relation.direction as
      | TAbsoluteDirection
      | TRelativeDirection
    const directionRegion = Direction.computeRegion(
      origin,
      direction,
      'outside',
      context,
    )
    const directionDelta = context.getDirectionDelta(direction)
    const distance = Distance.normalize(
      relation.distance as TEuclideanDistance | TEuclideanDistanceRange,
    )
    const meanDistanceDelta = context.getDistanceDelta() * distance.mean
    const minDistance =
      distance.min - meanDistanceDelta * 1.5 < 0
        ? 0
        : distance.min - meanDistanceDelta * 1.5
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3
    const distanceRegion = Distance.computeRegionAwayFromObject(
      origin,
      [minDistance, maxDistance],
      'outside',
    ) as TRegionRegion
    const region = Topology.intersection(
      directionRegion,
      distanceRegion,
    ) as GeolocusMultiPolygonObject
    const pdf: IRegionPDF = {
      type: 'distanceAndAngle',
      origin,
      gdf: {
        distance: distance.mean,
        distanceDelta,
        azimuth: directionDelta[0],
        azimuthDelta: directionDelta[1],
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  static topologyAndDistance = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    target: TGeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<
      TTopologyRelation,
      (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => IRegionHandlerResult
    > = {
      equal: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const distance = this.distance(origin, relation, target)
        return distance
      },
      contain: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const distance = this.distance(origin, relation, target, 'inside')
        const intersection = this.intersection(topology.region, distance.region)
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const distance = this.distance(origin, relation, target, 'both')
        const intersection = this.intersection(topology.region, distance.region)
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology as TTopologyRelation
    const result = map[topology](origin, relation, target)
    return result
  }

  static topologyAndDirection = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    target: TGeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<
      TTopologyRelation,
      (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => IRegionHandlerResult
    > = {
      equal: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const direction = this.direction(origin, relation, target)
        return direction
      },
      contain: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'inside')
        const intersection = this.intersection(
          topology.region,
          direction.region,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'both')
        const intersection = this.intersection(
          topology.region,
          direction.region,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology as TTopologyRelation
    const result = map[topology](origin, relation, target)
    return result
  }

  // 存在距离默认相离
  static all = (
    origin: TGeolocusObject,
    relation: IGeoRelation,
    target: TGeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<
      TTopologyRelation,
      (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => IRegionHandlerResult
    > = {
      equal: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: (origin: TGeolocusObject, relation: IGeoRelation) => {
        const directionAndDistance = this.directionAndDistance(origin, relation)
        return directionAndDistance
      },
      contain: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'inside')
        const distance = this.distance(origin, relation, target, 'inside')
        const intersection = this.intersection(
          topology.region,
          this.intersection(direction.region, distance.region),
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: TGeolocusObject,
        relation: IGeoRelation,
        target: TGeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'both')
        const distance = this.distance(origin, relation, target, 'both')
        const intersection = this.intersection(
          topology.region,
          this.intersection(direction.region, distance.region),
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology as TTopologyRelation
    const result = map[topology](origin, relation, target)
    return result
  }
}
