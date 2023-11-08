/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector2 } from '../math'
import { GeolocusObject, GeolocusPointObject, MaxBBoxPolygon } from '../object'
import { GeolocusMultiPolygonObject } from '../object/object'
import {
  AbsoluteDirection,
  EuclideanDistance,
  IGeoRelation,
  Topology,
  TopologyRelation,
} from '../relation'
import { Direction } from '../relation/direction'
import { IRegionPDF, IRegionResult } from './region'

export const DISTANCE_DELTA = 0.2
export const DIRECTION_PARAM: {
  [props in AbsoluteDirection]: [number, number]
} = {
  N: [0, Math.PI / 2],
  NE: [Math.PI / 4, Math.PI / 4],
  E: [Math.PI / 2, Math.PI / 2],
  SE: [(Math.PI / 4) * 3, Math.PI / 4],
  S: [Math.PI, Math.PI / 2],
  SW: [(Math.PI / 4) * 5, Math.PI / 4],
  W: [(Math.PI / 2) * 3, Math.PI / 2],
  NW: [(Math.PI / 4) * 7, Math.PI / 4],
}

export interface IRegionHandler {
  (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
    result: IRegionResult,
    index: number,
  ): void
}

export interface IRelationHandler {
  (
    origin: GeolocusObject,
    target: GeolocusObject,
    result: IRegionResult,
  ): {
    topologyRegion: IRegionResult['region']
    topologyPDF: IRegionPDF
  }
}

const equalHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 1)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const topologyPDF: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    distance: null,
    distanceDelta: null,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF }
}

const containHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 1)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const bbox = fuzzyRegion.getBBox()
  const length = Vector2.distanceTo([bbox[0], bbox[1]], [bbox[2], bbox[3]])
  const topologyPDF: IRegionPDF = {
    type: 1,
    origin: origin.getCenter(),
    distance: 0,
    distanceDelta: length * 0.5,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF }
}

const intersectHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const targetBBox = target.getBBox()
  const targetLength = Vector2.distanceTo(
    [targetBBox[0], targetBBox[1]],
    [targetBBox[2], targetBBox[3]],
  )
  const fuzzyRegion = Topology.bufferOfDistance(origin, targetLength)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const fuzzyBBox = fuzzyRegion.getBBox()
  const fuzzyLength = Vector2.distanceTo(
    [fuzzyBBox[0], fuzzyBBox[1]],
    [fuzzyBBox[2], fuzzyBBox[3]],
  )
  const topologyPDF: IRegionPDF = {
    type: 1,
    origin: origin.getCenter(),
    distance: 0,
    distanceDelta: fuzzyLength * 0.5,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF }
}

const disjointHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const buffer = Topology.bufferOfDistance(origin, 1)
  const fuzzyRegion = Topology.mask(MaxBBoxPolygon, buffer)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const topologyPDF: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    distance: null,
    distanceDelta: null,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF }
}

export const regionHandlerOfTopology: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const topology = relation.topology as TopologyRelation
  const map = {
    equal: equalHandler,
    contain: containHandler,
    intersect: intersectHandler,
    disjoint: disjointHandler,
  }

  const { topologyRegion, topologyPDF } = map[topology](origin, target, result)
  result.region = topologyRegion
  result.PDF[index] = topologyPDF
}

export const regionHandlerOfDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const direction = relation.direction as AbsoluteDirection
  const fuzzyRegion = Direction.computeRegion(origin, direction)
  result.region = Topology.intersection(fuzzyRegion, result.region!)

  result.PDF[index] = {
    type: 2,
    origin: origin.getCenter(),
    distance: null,
    distanceDelta: null,
    azimuth: DIRECTION_PARAM[direction][0],
    azimuthDelta: DIRECTION_PARAM[direction][1],
  }
}

export const regionHandlerOfDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const distance = relation.distance as EuclideanDistance
  const buffer = Topology.bufferOfDistance(origin, 1.5 * distance)
  result.region = Topology.intersection(result.region!, buffer)

  result.PDF[index] = {
    type: 1,
    origin: origin.getCenter(),
    distance,
    distanceDelta: DISTANCE_DELTA * distance,
    azimuth: null,
    azimuthDelta: null,
  }
}

export const regionHandlerOfTopologyAndDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const topology = relation.topology as TopologyRelation
  const direction = relation.direction as AbsoluteDirection
  const map = {
    equal: () => {
      const { topologyRegion, topologyPDF } = equalHandler(
        origin,
        target,
        result,
      )

      const region = topologyRegion
      const pdf = topologyPDF

      return { region, pdf }
    },
    contain: () => {
      const { topologyRegion, topologyPDF } = containHandler(
        origin,
        target,
        result,
      )

      const region = topologyRegion

      const topologyDistanceDelta = topologyPDF.distanceDelta as number
      const distanceDelta =
        DIRECTION_PARAM[direction][0] === 1
          ? topologyDistanceDelta / Math.SQRT2
          : topologyDistanceDelta
      const pdf: IRegionPDF = {
        type: 3,
        origin: topologyPDF.origin,
        distance: distanceDelta / 2,
        distanceDelta,
        azimuth: DIRECTION_PARAM[direction][0],
        azimuthDelta: DIRECTION_PARAM[direction][1],
      }

      return { region, pdf }
    },
    intersect: () => {
      const { topologyRegion, topologyPDF } = intersectHandler(
        origin,
        target,
        result,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter),
        direction,
      )
      let region: GeolocusMultiPolygonObject | null = null
      if (topologyRegion) {
        region = Topology.intersection(directionRegion, topologyRegion)
      }

      const topologyDistanceDelta = topologyPDF.distanceDelta as number
      const distanceDelta =
        DIRECTION_PARAM[direction][0] === 1
          ? topologyDistanceDelta / Math.SQRT2
          : topologyDistanceDelta
      const pdf: IRegionPDF = {
        type: 3,
        origin: topologyPDF.origin,
        distance: distanceDelta / 2,
        distanceDelta,
        azimuth: DIRECTION_PARAM[direction][0],
        azimuthDelta: DIRECTION_PARAM[direction][1],
      }

      return { region, pdf }
    },
    disjoint: () => {
      const { topologyRegion, topologyPDF } = disjointHandler(
        origin,
        target,
        result,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter),
        direction,
      )
      let region: GeolocusMultiPolygonObject | null = null
      if (topologyRegion) {
        region = Topology.intersection(directionRegion, topologyRegion)
      }

      const pdf: IRegionPDF = topologyPDF

      return { region, pdf }
    },
  }

  const { region, pdf } = map[topology]()
  result.region = region
  result.PDF[index] = pdf
}

export const regionHandlerOfTopologyAndDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  regionHandlerOfDistance(origin, relation, target, result, index)
}

export const regionHandlerOfDirectionAndDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const direction = relation.direction as AbsoluteDirection
  const fuzzyRegion = Direction.computeRegion(origin, direction)

  const distance = relation.distance as EuclideanDistance
  const buffer = Topology.bufferOfDistance(origin, 1.5 * distance)

  const intersection = Topology.intersection(fuzzyRegion, buffer)
  result.region = Topology.intersection(intersection!, result.region!)

  result.PDF[index] = {
    type: 3,
    origin: origin.getCenter(),
    distance,
    distanceDelta: DISTANCE_DELTA * distance,
    azimuth: DIRECTION_PARAM[direction][0],
    azimuthDelta: DIRECTION_PARAM[direction][1],
  }
}

export const regionHandlerOfAll: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  regionHandlerOfDirectionAndDistance(origin, relation, target, result, index)
}
