/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector2 } from '../math'
import { GeolocusObject, MaxBBoxPolygon } from '../object'
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
    region: IRegionResult['region']
    pdf: IRegionPDF
  }
}

const equalHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 1)
  const region = Topology.intersection(fuzzyRegion, result.region!)
  const pdf: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    distance: null,
    distanceDelta: null,
    azimuth: null,
    azimuthDelta: null,
  }

  return { region, pdf }
}

const containHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const originBBox = origin.getBBox()
  const length = Vector2.distanceTo(
    [originBBox[0], originBBox[1]],
    [originBBox[2], originBBox[3]],
  )

  const fuzzyRegion = Topology.bufferOfDistance(origin, length * DISTANCE_DELTA)
  const region = Topology.intersection(fuzzyRegion, result.region!)
  const pdf: IRegionPDF = {
    type: 1,
    origin: origin.getCenter(),
    distance: 0,
    distanceDelta: length / 2,
    azimuth: null,
    azimuthDelta: null,
  }

  return { region, pdf }
}

const intersectHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const targetBBox = target.getBBox()
  const distance = Vector2.distanceTo(
    [targetBBox[0], targetBBox[1]],
    [targetBBox[2], targetBBox[3]],
  )

  const fuzzyRegion = Topology.bufferOfDistance(
    origin,
    distance * DISTANCE_DELTA,
  )
  const region = Topology.intersection(fuzzyRegion, result.region!)
  const pdf: IRegionPDF = {
    type: 1,
    origin: origin.getCenter(),
    distance: 0,
    distanceDelta: distance / 2,
    azimuth: null,
    azimuthDelta: null,
  }

  return { region, pdf }
}

const disjointHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const targetBBox = target.getBBox()
  const distance = Vector2.distanceTo(
    [targetBBox[0], targetBBox[1]],
    [targetBBox[2], targetBBox[3]],
  )

  const buffer = Topology.bufferOfDistance(origin, distance * DISTANCE_DELTA)
  const fuzzyRegion = Topology.mask(MaxBBoxPolygon, buffer)
  const region = Topology.intersection(fuzzyRegion, result.region!)
  const pdf: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    distance: null,
    distanceDelta: null,
    azimuth: null,
    azimuthDelta: null,
  }

  return { region, pdf }
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

  const { region, pdf } = map[topology](origin, target, result)
  result.region = region
  result.PDF[index] = pdf
}

export const regionHandlerOfDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const region = result.region
  if (!region) {
    throw new Error("Can't compute the fuzzy region.")
  }

  const direction = relation.direction as AbsoluteDirection

  const fuzzyRegion = Direction.computeRegion(origin, direction)
  result.region = Topology.intersection(fuzzyRegion, region)
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
  const region = result.region
  if (!region) {
    throw new Error("Can't compute the fuzzy region.")
  }

  const distance = relation.distance as EuclideanDistance
  const buffer = Topology.bufferOfDistance(origin, 1.5 * distance)
  result.region = Topology.intersection(region, buffer)
  result.PDF[index] = {
    type: 1,
    origin: origin.getCenter(),
    distance,
    distanceDelta: DISTANCE_DELTA * distance,
    azimuth: null,
    azimuthDelta: null,
  }
}

// export const regionHandlerOfTopologyAndDirection: IRegionHandler = (
//   origin: GeolocusObject,
//   relation: IGeoRelation,
//   target: GeolocusObject,
//   result: IRegionResult,
//   index: number,
// ) => {
//   //
// }
