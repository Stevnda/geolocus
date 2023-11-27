/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../context/context'
import { Compare, Vector2 } from '../math'
import { GeolocusObject, GeolocusPointObject, MaxBBoxPolygon } from '../object'
import { GeolocusMultiPolygonObject } from '../object/object'
import {
  Direction,
  IGeoRelation,
  Topology,
  TopologyRelation,
} from '../relation'
import { AbsoluteDirection, EuclideanDistance } from '../type'
import {
  IRegionHandler,
  IRegionPDF,
  IRegionResult,
  IRelationHandler,
} from './type'

const equalHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 0.05)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const topologyPDF: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    distance: null,
    distanceDelta: null,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF, fuzzyRegion }
}

const containHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 0.05)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const bbox = fuzzyRegion.getBBox()
  const length = Vector2.distanceTo([bbox[0], bbox[1]], [bbox[2], bbox[3]])
  const topologyPDF: IRegionPDF = {
    type: 1,
    origin: origin.getCenter(),
    distance: 0,
    distanceDelta: (length / 3) * 2,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF, fuzzyRegion }
}

const intersectHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const targetBBox = target.getBBox()
  let targetLength = Vector2.distanceTo(
    [targetBBox[0], targetBBox[1]],
    [targetBBox[2], targetBBox[3]],
  )
  if (Compare.LE(targetLength, 0.05)) targetLength = 0.05
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
    distanceDelta: (fuzzyLength / 3) * 2,
    azimuth: null,
    azimuthDelta: null,
  }

  return { topologyRegion, topologyPDF, fuzzyRegion }
}

const disjointHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const buffer = Topology.bufferOfDistance(origin, 0.05)
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

  return { topologyRegion, topologyPDF, fuzzyRegion }
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

export const regionHandlerOfDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const distance = relation.distance as EuclideanDistance
  const buffer = Topology.bufferOfDistance(
    origin,
    (1 + GeolocusContext.DISTANCE_DELTA * 1.5) * distance,
  )
  result.region = Topology.intersection(result.region!, buffer)

  result.PDF[index] = {
    type: 1,
    origin: origin.getCenter(),
    distance,
    distanceDelta: GeolocusContext.DISTANCE_DELTA * distance,
    azimuth: null,
    azimuthDelta: null,
  }
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
    azimuth: GeolocusContext.DIRECTION_PARAM[direction][0],
    azimuthDelta: GeolocusContext.DIRECTION_PARAM[direction][1],
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
      const { topologyRegion, topologyPDF, fuzzyRegion } = containHandler(
        origin,
        target,
        result,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter),
        direction,
      )
      let region = topologyRegion
      if (topologyRegion) {
        region = Topology.intersection(topologyRegion, directionRegion)
      }
      const insideDirectionRegion = Topology.intersection(
        fuzzyRegion,
        directionRegion,
      ) as GeolocusMultiPolygonObject
      const insideCenter = insideDirectionRegion.getCenter()

      const topologyDistanceDelta = topologyPDF.distanceDelta as number
      const pdf: IRegionPDF = {
        type: 3,
        origin: insideCenter,
        distance: 0,
        distanceDelta: topologyDistanceDelta,
        azimuth: GeolocusContext.DIRECTION_PARAM[direction][0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM[direction][1],
      }

      return { region, pdf }
    },
    intersect: () => {
      const { topologyRegion, topologyPDF, fuzzyRegion } = intersectHandler(
        origin,
        target,
        result,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter),
        direction,
      )
      let region = topologyRegion
      if (topologyRegion) {
        region = Topology.intersection(topologyRegion, directionRegion)
      }
      const insideDirectionRegion = Topology.intersection(
        fuzzyRegion,
        directionRegion,
      ) as GeolocusMultiPolygonObject
      const insideCenter = insideDirectionRegion.getCenter()

      const pdf: IRegionPDF = {
        type: 3,
        origin: insideCenter,
        distance: 0,
        distanceDelta: topologyPDF.distanceDelta,
        azimuth: GeolocusContext.DIRECTION_PARAM[direction][0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM[direction][1],
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
      let region = topologyRegion
      if (topologyRegion) {
        region = Topology.intersection(directionRegion, topologyRegion)
      }

      const pdf: IRegionPDF = {
        type: 2,
        origin: topologyPDF.origin,
        distance: topologyPDF.distance,
        distanceDelta: topologyPDF.distanceDelta,
        azimuth: GeolocusContext.DIRECTION_PARAM[direction][0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM[direction][1],
      }

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
  const buffer = Topology.bufferOfDistance(
    origin,
    (1 + GeolocusContext.DISTANCE_DELTA * 1.5) * distance,
  )

  const intersection = Topology.intersection(fuzzyRegion, buffer)
  result.region = Topology.intersection(intersection!, result.region!)

  result.PDF[index] = {
    type: 3,
    origin: origin.getCenter(),
    distance,
    distanceDelta: GeolocusContext.DISTANCE_DELTA * distance,
    azimuth: GeolocusContext.DIRECTION_PARAM[direction][0],
    azimuthDelta: GeolocusContext.DIRECTION_PARAM[direction][1],
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
