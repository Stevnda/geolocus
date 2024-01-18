/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '@/context'
import {
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPolygonObject,
  createEmptyGeolocusObject,
  createPolygonFromBBox,
} from '@/object'
import {
  AbsoluteDirection,
  Direction,
  DirectionAndDistanceTag,
  Distance,
  EuclideanDistance,
  EuclideanDistanceRange,
  IGeoRelation,
  RelativeDirection,
  Topology,
  TopologyRelation,
} from '@/relation'
import { Compare, GEO_MAX_VALUE, Vector2 } from '@/util'
import { IRegionHandlerResult, IRegionPDF, IRegionRegion } from './type'

export class RegionResultHandler {
  private static equalHandler = (
    origin: GeolocusObject,
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
    origin: GeolocusObject,
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
        girdNum: origin.getContext()!.getResultGirdNum(),
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: false }
  }

  private static intersectHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
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
    let region: IRegionRegion
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
        girdNum: origin.getContext()!.getResultGirdNum(),
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  private static disjointHandler = (
    origin: GeolocusObject,
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

  private static intersectionHandler = (
    object0: GeolocusObject,
    object1: GeolocusObject,
  ) => {
    let intersection = Topology.intersection(object0, object1)
    if (!intersection) {
      intersection = createEmptyGeolocusObject('Polygon')
    }
    return intersection as IRegionRegion
  }

  static topology = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): IRegionHandlerResult => {
    const topology = relation.topology as TopologyRelation
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
    origin: GeolocusObject,
    relation: IGeoRelation,
    _: GeolocusObject,
    tag: DirectionAndDistanceTag = 'outside',
  ): IRegionHandlerResult => {
    const context = origin.getContext() as GeolocusContext
    const distance = Distance.normalize(
      relation.distance as EuclideanDistance | EuclideanDistanceRange,
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
    origin: GeolocusObject,
    relation: IGeoRelation,
    _: GeolocusObject,
    tag: DirectionAndDistanceTag = 'outside',
  ): IRegionHandlerResult => {
    const context = origin.getContext() as GeolocusContext
    const direction = relation.direction as
      | AbsoluteDirection
      | RelativeDirection
    const directionDelta = context.getDirectionDelta(direction)
    const region = Direction.computeRegion(origin, direction, tag)
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
    origin: GeolocusObject,
    relation: IGeoRelation,
  ): IRegionHandlerResult => {
    const context = origin.getContext() as GeolocusContext
    const direction = relation.direction as
      | AbsoluteDirection
      | RelativeDirection
    const directionRegion = Direction.computeRegion(
      origin,
      direction,
      'outside',
    )
    const directionDelta = context.getDirectionDelta(direction)
    const distance = Distance.normalize(
      relation.distance as EuclideanDistance | EuclideanDistanceRange,
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
    ) as IRegionRegion
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
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => IRegionHandlerResult
    > = {
      equal: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const distance = this.distance(origin, relation, target)
        return distance
      },
      contain: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const distance = this.distance(origin, relation, target, 'inside')
        const intersection = this.intersectionHandler(
          topology.region,
          distance.region,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const distance = this.distance(origin, relation, target, 'both')
        const intersection = this.intersectionHandler(
          topology.region,
          distance.region,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology as TopologyRelation
    const result = map[topology](origin, relation, target)
    return result
  }

  static topologyAndDirection = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => IRegionHandlerResult
    > = {
      equal: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const direction = this.direction(origin, relation, target)
        return direction
      },
      contain: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'inside')
        const intersection = this.intersectionHandler(
          topology.region,
          direction.region,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'both')
        const intersection = this.intersectionHandler(
          topology.region,
          direction.region,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology as TopologyRelation
    const result = map[topology](origin, relation, target)
    return result
  }

  // 存在距离默认相离
  static all = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => IRegionHandlerResult
    > = {
      equal: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: (origin: GeolocusObject, relation: IGeoRelation) => {
        const directionAndDistance = this.directionAndDistance(origin, relation)
        return directionAndDistance
      },
      contain: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'inside')
        const distance = this.distance(origin, relation, target, 'inside')
        const intersection = this.intersectionHandler(
          topology.region,
          this.intersectionHandler(direction.region, distance.region),
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: GeolocusObject,
        relation: IGeoRelation,
        target: GeolocusObject,
      ) => {
        const topology = this.topology(origin, relation, target)
        const direction = this.direction(origin, relation, target, 'both')
        const distance = this.distance(origin, relation, target, 'both')
        const intersection = this.intersectionHandler(
          topology.region,
          this.intersectionHandler(direction.region, distance.region),
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology as TopologyRelation
    const result = map[topology](origin, relation, target)
    return result
  }
}
