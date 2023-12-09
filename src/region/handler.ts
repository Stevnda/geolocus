/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../context'
import { Compare, GEO_MAX_VALUE, Vector2 } from '../math'
import { GeolocusPointObject, GeolocusPolygonObject } from '../object'
import { Direction, Topology } from '../relation'
import {
  AbsoluteDirection,
  EuclideanDistance,
  GeolocusObject,
  IGeoRelation,
  TopologyRelation,
} from '../type'
import {
  IRegionHandler,
  IRegionPDF,
  IRegionResult,
  IRelationHandler,
} from './region.type'

const equalHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 0.005)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)
  const topologyPDF: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      geolocusObject: null,
      girdNum: null,
    },
  }
  return { topologyRegion, topologyPDF }
}

const containHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 0.005)
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)
  const topologyPDF: IRegionPDF = {
    type: 4,
    origin: origin.getCenter(),
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      geolocusObject: fuzzyRegion,
      girdNum: origin.getContext()!.getGirdSize(),
    },
  }

  return { topologyRegion, topologyPDF }
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
  if (Compare.LE(targetLength, 0.005)) targetLength = 0.005
  const objectType = origin.getType()
  let fuzzyRegion = null
  if (objectType === 'Point' || objectType === 'LineString') {
    fuzzyRegion = Topology.bufferOfDistance(origin, targetLength)
  } else {
    fuzzyRegion = Topology.bufferOfRange(origin, [-targetLength, targetLength])
  }
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)

  const topologyPDF: IRegionPDF = {
    type: 4,
    origin: origin.getCenter(),
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      geolocusObject: fuzzyRegion,
      girdNum: origin.getContext()!.getGirdSize(),
    },
  }

  return { topologyRegion, topologyPDF }
}

const disjointHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const buffer = Topology.bufferOfDistance(origin, 0.005)
  const fuzzyRegion = Topology.mask(
    GeolocusPolygonObject.fromBBox(
      [-GEO_MAX_VALUE, -GEO_MAX_VALUE, GEO_MAX_VALUE, GEO_MAX_VALUE],
      null,
    ),
    buffer,
  )
  const topologyRegion = Topology.intersection(fuzzyRegion, result.region!)
  const topologyPDF: IRegionPDF = {
    type: 0,
    origin: origin.getCenter(),
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      geolocusObject: null,
      girdNum: null,
    },
  }

  return { topologyRegion, topologyPDF }
}

export const regionHandlerOfTopology: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
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
  result.pdf.push(topologyPDF)
}

// 只有距离关系默认是相离
export const regionHandlerOfDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const context = origin.getContext() as GeolocusContext
  const distance = relation.distance as EuclideanDistance
  // martinez-polygon-clipping 的 intersect 函数的 bug, 加一个极小的随机误差
  const buffer = Topology.bufferOfRange(origin, [
    (1 - context.getDistanceDelta() * 1.5) * distance - Math.random() / 100,
    (1 + context.getDistanceDelta() * 1.5) * distance + Math.random() / 100,
  ])
  result.region = Topology.intersection(result.region!, buffer)

  result.pdf.push({
    type: 1,
    origin: origin.getCenter(),
    gdf: {
      distance,
      distanceDelta: context.getDistanceDelta() * distance,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      geolocusObject: null,
      girdNum: null,
    },
  })
}

// 只有方向关系默认是相离
export const regionHandlerOfDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const context = origin.getContext() as GeolocusContext
  const direction = relation.direction as AbsoluteDirection
  const directionRegion = Direction.computeRegion(origin, direction)
  result.region = Topology.intersection(directionRegion, result.region!)

  result.pdf.push({
    type: 2,
    origin: origin.getCenter(),
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: context.getDirectionDelta()[direction][0],
      azimuthDelta: context.getDirectionDelta()[direction][1],
    },
    sdf: {
      geolocusObject: null,
      girdNum: null,
    },
  })
}

export const regionHandlerOfTopologyAndDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
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

      result.region = topologyRegion
      result.pdf.push(topologyPDF)
    },
    contain: () => {
      const { topologyRegion, topologyPDF } = containHandler(
        origin,
        target,
        result,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter, null),
        direction,
      )
      let region = topologyRegion
      if (topologyRegion) {
        region = Topology.intersection(topologyRegion, directionRegion)
      }

      result.region = region
      result.pdf.push(topologyPDF)
    },
    intersect: () => {
      const { topologyRegion, topologyPDF } = intersectHandler(
        origin,
        target,
        result,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter, null),
        direction,
      )
      let region = topologyRegion
      if (topologyRegion) {
        region = Topology.intersection(topologyRegion, directionRegion)
      }

      result.region = region
      result.pdf.push(topologyPDF)
    },
    disjoint: () => {
      regionHandlerOfDirection(origin, relation, target, result)
    },
  }

  map[topology]()
}

// 只有距离默认为相离
export const regionHandlerOfTopologyAndDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  regionHandlerOfDistance(origin, relation, target, result)
}

export const regionHandlerOfDirectionAndDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  const context = origin.getContext() as GeolocusContext
  const direction = relation.direction as AbsoluteDirection
  const directionRegion = Direction.computeRegion(origin, direction)

  const distance = relation.distance as EuclideanDistance
  // martinez-polygon-clipping 的 intersect 函数的 bug, 加一个极小的随机误差
  const buffer = Topology.bufferOfRange(origin, [
    (1 - context.getDistanceDelta() * 1.5) * distance - Math.random() / 100,
    (1 + context.getDistanceDelta() * 1.5) * distance + Math.random() / 100,
  ])

  result.region = Topology.intersection(
    Topology.intersection(directionRegion, buffer)!,
    result.region!,
  )
  result.pdf.push({
    type: 3,
    origin: origin.getCenter(),
    gdf: {
      distance,
      distanceDelta: context.getDistanceDelta() * distance,
      azimuth: context.getDirectionDelta()[direction][0],
      azimuthDelta: context.getDirectionDelta()[direction][1],
    },
    sdf: {
      geolocusObject: null,
      girdNum: null,
    },
  })
}

export const regionHandlerOfAll: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
) => {
  regionHandlerOfDirectionAndDistance(origin, relation, target, result)
}
