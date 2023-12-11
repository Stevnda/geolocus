/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../context'
import {
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'
import { Direction, Topology } from '../relation'
import {
  AbsoluteDirection,
  EuclideanDistance,
  GeolocusObject,
  IGeoRelation,
  TopologyRelation,
} from '../type'
import { Compare, GEO_MAX_VALUE, Vector2 } from '../util'
import { IRegionHandler, IRegionPDF, IRelationHandler } from './region.type'

const equalHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 0.005)
  const topologyRegion = Topology.intersection(fuzzyRegion, region)
  const topologyPDF: IRegionPDF = {
    type: 0,
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
  }
  return { topologyRegion, topologyPDF }
}

const containHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const fuzzyRegion = Topology.bufferOfDistance(origin, 0.005)
  const topologyRegion = Topology.intersection(fuzzyRegion, region)
  const topologyPDF: IRegionPDF = {
    type: 4,
    origin,
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      girdRegion: fuzzyRegion,
      girdNum: origin.getContext()!.getGirdSize(),
    },
  }

  return { topologyRegion, topologyPDF }
}

const intersectHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const originBBox = origin.getBBox()
  const originLength =
    Vector2.distanceTo(
      [originBBox[0], originBBox[1]],
      [originBBox[2], originBBox[3]],
    ) * 0.05
  const targetBBox = target.getBBox()
  let targetLength = Vector2.distanceTo(
    [targetBBox[0], targetBBox[1]],
    [targetBBox[2], targetBBox[3]],
  )
  if (Compare.LE(targetLength, 0.005)) targetLength = 0.005
  if (Compare.LE(targetLength, originLength)) targetLength = originLength
  const objectType = origin.getType()
  let fuzzyRegion = null
  if (objectType === 'Point' || objectType === 'LineString') {
    fuzzyRegion = Topology.bufferOfDistance(origin, targetLength)
  } else {
    fuzzyRegion = Topology.bufferOfRange(origin, [-targetLength, targetLength])
  }
  const topologyRegion = Topology.intersection(fuzzyRegion, region)

  const topologyPDF: IRegionPDF = {
    type: 4,
    origin,
    gdf: {
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    },
    sdf: {
      girdRegion: fuzzyRegion,
      girdNum: origin.getContext()!.getGirdSize(),
    },
  }

  return { topologyRegion, topologyPDF }
}

const disjointHandler: IRelationHandler = (
  origin: GeolocusObject,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const bboxPolygon = GeolocusPolygonObject.fromBBox(origin.getBBox())
  const buffer = Topology.bufferOfDistance(bboxPolygon, 0.005)
  const fuzzyRegion = Topology.mask(
    GeolocusPolygonObject.fromBBox(
      [-GEO_MAX_VALUE, -GEO_MAX_VALUE, GEO_MAX_VALUE, GEO_MAX_VALUE],
      null,
    ),
    buffer,
  )
  const topologyRegion = Topology.intersection(fuzzyRegion, region)
  const topologyPDF: IRegionPDF = {
    type: 0,
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
  }

  return { topologyRegion, topologyPDF }
}

export const regionHandlerOfTopology: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const topology = relation.topology as TopologyRelation
  const map = {
    equal: equalHandler,
    contain: containHandler,
    intersect: intersectHandler,
    disjoint: disjointHandler,
  }

  const { topologyRegion, topologyPDF } = map[topology](origin, target, region)
  return { topologyRegion, topologyPDF }
}

// 只有距离关系默认是相离
export const regionHandlerOfDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const context = origin.getContext() as GeolocusContext
  const distance = relation.distance as EuclideanDistance
  const bboxPolygon = GeolocusPolygonObject.fromBBox(origin.getBBox())
  // martinez-polygon-clipping 的 intersect 函数的 bug, 加一个极小的随机误差
  const buffer = Topology.bufferOfRange(bboxPolygon, [
    (1 - context.getDistanceDelta() * 1.5) * distance - Math.random() / 100,
    (1 + context.getDistanceDelta() * 1.5) * distance + Math.random() / 100,
  ])
  const topologyRegion = Topology.intersection(region, buffer)
  const topologyPDF: IRegionPDF = {
    type: 1,
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
  }

  return { topologyRegion, topologyPDF }
}

// 只有方向关系默认是相离
export const regionHandlerOfDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const context = origin.getContext() as GeolocusContext
  const bboxPolygon = GeolocusPolygonObject.fromBBox(origin.getBBox())
  const direction = relation.direction as AbsoluteDirection
  const directionRegion = Direction.computeRegion(bboxPolygon, direction)
  const topologyRegion = Topology.intersection(directionRegion, region)
  const topologyPDF: IRegionPDF = {
    type: 2,
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
  }

  return { topologyRegion, topologyPDF }
}

export const regionHandlerOfTopologyAndDirection: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const topology = relation.topology as TopologyRelation
  const direction = relation.direction as AbsoluteDirection
  const map = {
    equal: () => {
      const { topologyRegion, topologyPDF } = equalHandler(
        origin,
        target,
        region,
      )

      return { topologyRegion, topologyPDF }
    },
    contain: () => {
      const { topologyRegion, topologyPDF } = containHandler(
        origin,
        target,
        region,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter),
        direction,
      )
      let tempRegion = topologyRegion
      if (topologyRegion) {
        tempRegion = Topology.intersection(topologyRegion, directionRegion)
      }
      const tempPDF = topologyPDF
      tempPDF.sdf.girdRegion = tempRegion

      return { topologyRegion: tempRegion, topologyPDF: tempPDF }
    },
    intersect: () => {
      const { topologyRegion, topologyPDF } = intersectHandler(
        origin,
        target,
        region,
      )

      const originCenter = origin.getCenter()
      const directionRegion = Direction.computeRegion(
        new GeolocusPointObject(originCenter, null),
        direction,
      )
      let tempRegion = topologyRegion
      if (topologyRegion) {
        tempRegion = Topology.intersection(topologyRegion, directionRegion)
      }
      const tempPDF = topologyPDF
      tempPDF.sdf.girdRegion = tempRegion

      return { topologyRegion: tempRegion, topologyPDF: tempPDF }
    },
    disjoint: () => {
      return regionHandlerOfDirection(origin, relation, target, region)
    },
  }

  return map[topology]()
}

// 只有距离默认为相离
export const regionHandlerOfTopologyAndDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  return regionHandlerOfDistance(origin, relation, target, region)
}

// 默认相离
export const regionHandlerOfDirectionAndDistance: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  const context = origin.getContext() as GeolocusContext
  const direction = relation.direction as AbsoluteDirection
  const directionRegion = Direction.computeRegion(origin, direction)

  const distance = relation.distance as EuclideanDistance
  const bboxPolygon = GeolocusPolygonObject.fromBBox(origin.getBBox())
  // martinez-polygon-clipping 的 intersect 函数的 bug, 加一个极小的随机误差
  const buffer = Topology.bufferOfRange(bboxPolygon, [
    (1 - context.getDistanceDelta() * 1.5) * distance - Math.random() / 100,
    (1 + context.getDistanceDelta() * 1.5) * distance + Math.random() / 100,
  ])

  const topologyRegion = Topology.intersection(
    Topology.intersection(directionRegion, buffer)!,
    region,
  )
  const topologyPDF: IRegionPDF = {
    type: 3,
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
  }

  return { topologyRegion, topologyPDF }
}

export const regionHandlerOfAll: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
) => {
  return regionHandlerOfDirectionAndDistance(origin, relation, target, region)
}
