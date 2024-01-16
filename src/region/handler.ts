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
  IGeoRelation,
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
      equal: () => this.equalHandler(origin, relation),
      contain: () => this.containHandler(origin, relation),
      intersect: () => this.intersectHandler(origin, relation, target),
      disjoint: () => this.disjointHandler(origin, relation),
    }
    const result = map[topology]()

    return result
  }

  static distance = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    _: GeolocusObject,
    tag: DirectionAndDistanceTag = 'outside',
  ): IRegionHandlerResult => {
    const context = origin.getContext() as GeolocusContext
    const distance = relation.distance as EuclideanDistance
    let region = Distance.computeRegionAwayFromObject(
      origin,
      [
        (1 - context.getDistanceDelta() * 1.5) * distance,
        (1 + context.getDistanceDelta() * 1.5) * distance,
      ],
      tag,
    )
    if (!region) {
      region = createEmptyGeolocusObject('Polygon')
    }
    const pdf: IRegionPDF = {
      type: 'distance',
      origin,
      gdf: {
        distance,
        distanceDelta: context.getDistanceDelta() * distance,
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
    const direction = relation.direction as AbsoluteDirection
    const region = Direction.computeRegion(origin, direction, tag)
    const pdf: IRegionPDF = {
      type: 'angle',
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: context.getDirectionDelta()[direction][0],
        azimuthDelta: context.getDirectionDelta()[direction][1],
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
    const direction = relation.direction as AbsoluteDirection
    const directionRegion = Direction.computeRegion(
      origin,
      direction,
      'outside',
    )
    const distance = relation.distance as EuclideanDistance
    const distanceRegion = Distance.computeRegionAwayFromObject(
      origin,
      [
        (1 - context.getDistanceDelta() * 1.5) * distance,
        (1 + context.getDistanceDelta() * 1.5) * distance,
      ],
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
        distance,
        distanceDelta: context.getDistanceDelta() * distance,
        azimuth: context.getDirectionDelta()[direction][0],
        azimuthDelta: context.getDirectionDelta()[direction][1],
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
    const map: Record<TopologyRelation, () => IRegionHandlerResult> = {
      equal: () => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: () => {
        const distance = this.distance(origin, relation, target)
        return distance
      },
      contain: () => {
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
      intersect: () => {
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
    const result = map[topology]()
    return result
  }

  static topologyAndDirection = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<TopologyRelation, () => IRegionHandlerResult> = {
      equal: () => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: () => {
        const direction = this.direction(origin, relation, target)
        return direction
      },
      contain: () => {
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
      intersect: () => {
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
    const result = map[topology]()
    return result
  }

  // 存在距离默认相离
  static all = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): IRegionHandlerResult => {
    const map: Record<TopologyRelation, () => IRegionHandlerResult> = {
      equal: () => {
        const topology = this.topology(origin, relation, target)
        return topology
      },
      disjoint: () => {
        const directionAndDistance = this.directionAndDistance(origin, relation)
        return directionAndDistance
      },
      contain: () => {
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
      intersect: () => {
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
    const result = map[topology]()
    return result
  }
}
