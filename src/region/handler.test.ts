import { Vector2 } from '../math'
import { GeolocusContext } from '../meta/context'
import { GeolocusPointObject, MaxBBoxPolygon } from '../object'
import { Direction, IGeoRelation, Topology } from '../relation'
import {
  regionHandlerOfAll,
  regionHandlerOfDirection,
  regionHandlerOfDirectionAndDistance,
  regionHandlerOfDistance,
  regionHandlerOfTopology,
  regionHandlerOfTopologyAndDirection,
  regionHandlerOfTopologyAndDistance,
} from './handler'
import { IRegionResult } from './region'

describe('Test some handler functions of Region', () => {
  test('Test the regionHandlerOfTopology function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    let result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation[] = [
      'equal',
      'contain',
      'intersect',
      'disjoint',
    ].map((value) => {
      return {
        topology: value,
        direction: null,
        distance: null,
      } as IGeoRelation
    })

    const originBuffer = Topology.bufferOfDistance(origin, 0.1)
    const fuzzyBBox = originBuffer.getBBox()
    const distanceDelta =
      (Vector2.distanceTo(
        [fuzzyBBox[0], fuzzyBBox[1]],
        [fuzzyBBox[2], fuzzyBBox[3]],
      ) /
        3) *
      2

    // equal
    regionHandlerOfTopology(origin, relation[0], target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: originBuffer.getBBox(),
      pdf: {
        type: 0,
        origin: [0, 0],
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
    })
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // contain
    regionHandlerOfTopology(origin, relation[1], target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: originBuffer.getBBox(),
      pdf: {
        type: 1,
        origin: [0, 0],
        distance: 0,
        distanceDelta,
        azimuth: null,
        azimuthDelta: null,
      },
    })
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // intersect
    regionHandlerOfTopology(origin, relation[2], target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: originBuffer.getBBox(),
      pdf: {
        type: 1,
        origin: [0, 0],
        distance: 0,
        distanceDelta,
        azimuth: null,
        azimuthDelta: null,
      },
    })
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // disjoint
    regionHandlerOfTopology(origin, relation[3], target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: [
        -281474956479743, -281474956479743, 281474956479743, 281474956479743,
      ],
      pdf: {
        type: 0,
        origin: [0, 0],
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
    })
  })

  test('Test the regionHandlerOfDistance function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    const buffer = Topology.bufferOfDistance(
      origin,
      (1 + GeolocusContext.DISTANCE_DELTA * 1.5) * 100,
    )

    regionHandlerOfDistance(origin, relation, target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: buffer.getBBox(),
      pdf: {
        type: 1,
        origin: [0, 0],
        distance: 100,
        distanceDelta: GeolocusContext.DISTANCE_DELTA * 100,
        azimuth: null,
        azimuthDelta: null,
      },
    })
  })

  test('Test the regionHandlerOfDirection function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: null,
    }

    const fuzzyRegion = Direction.computeRegion(origin, 'N')

    regionHandlerOfDirection(origin, relation, target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: fuzzyRegion.getBBox(),
      pdf: {
        type: 2,
        origin: [0, 0],
        distance: null,
        distanceDelta: null,
        azimuth: GeolocusContext.DIRECTION_PARAM.N[0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM.N[1],
      },
    })
  })

  test('Test the regionHandlerOfTopologyAndDirection function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    let result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation[] = [
      'equal',
      'contain',
      'intersect',
      'disjoint',
    ].map((value) => {
      return {
        topology: value,
        direction: 'N',
        distance: null,
      } as IGeoRelation
    })

    const originBuffer = Topology.bufferOfDistance(origin, 0.1)
    const fuzzyBBox = originBuffer.getBBox()
    const distanceDelta =
      (Vector2.distanceTo(
        [fuzzyBBox[0], fuzzyBBox[1]],
        [fuzzyBBox[2], fuzzyBBox[3]],
      ) /
        3) *
      2
    console.log(distanceDelta)

    // equal
    regionHandlerOfTopologyAndDirection(
      origin,
      relation[0],
      target,
      result,
      index,
    )
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: originBuffer.getBBox(),
      pdf: {
        type: 0,
        origin: [0, 0],
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
    })
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // contain
    regionHandlerOfTopologyAndDirection(
      origin,
      relation[1],
      target,
      result,
      index,
    )
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: originBuffer.getBBox(),
      pdf: {
        type: 3,
        origin: [0, 0.05005594185997994],
        distance: 0,
        distanceDelta,
        azimuth: GeolocusContext.DIRECTION_PARAM.N[0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM.N[1],
      },
    })
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // intersect
    regionHandlerOfTopologyAndDirection(
      origin,
      relation[2],
      target,
      result,
      index,
    )
    expect({ pdf: result.PDF[0] }).toEqual({
      pdf: {
        type: 3,
        origin: [0, 0.05005594185997994],
        distance: 0,
        distanceDelta,
        azimuth: GeolocusContext.DIRECTION_PARAM.N[0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM.N[1],
      },
    })
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // disjoint
    regionHandlerOfTopologyAndDirection(
      origin,
      relation[3],
      target,
      result,
      index,
    )
    expect({ pdf: result.PDF[0] }).toEqual({
      pdf: {
        type: 2,
        origin: [0, 0],
        distance: null,
        distanceDelta: null,
        azimuth: GeolocusContext.DIRECTION_PARAM.N[0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM.N[1],
      },
    })
  })

  test('Test the regionHandlerOfTopologyAndDistance function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    const buffer = Topology.bufferOfDistance(
      origin,
      (1 + GeolocusContext.DISTANCE_DELTA * 1.5) * 100,
    )

    regionHandlerOfTopologyAndDistance(origin, relation, target, result, index)
    expect({ bbox: result.region?.getBBox(), pdf: result.PDF[0] }).toEqual({
      bbox: buffer.getBBox(),
      pdf: {
        type: 1,
        origin: [0, 0],
        distance: 100,
        distanceDelta: GeolocusContext.DISTANCE_DELTA * 100,
        azimuth: null,
        azimuthDelta: null,
      },
    })
  })

  test('Test the regionHandlerOfDirectionAndDistance function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    regionHandlerOfDirectionAndDistance(origin, relation, target, result, index)
    expect({ pdf: result.PDF[0] }).toEqual({
      pdf: {
        type: 3,
        origin: [0, 0],
        distance: 100,
        distanceDelta: GeolocusContext.DISTANCE_DELTA * 100,
        azimuth: GeolocusContext.DIRECTION_PARAM.N[0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM.N[1],
      },
    })
  })

  test('Test the regionHandlerOfAll function', () => {
    const origin = new GeolocusPointObject([0, 0])
    const target = new GeolocusPointObject([0, 0])
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    const index = 0
    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    regionHandlerOfAll(origin, relation, target, result, index)
    expect({ pdf: result.PDF[0] }).toEqual({
      pdf: {
        type: 3,
        origin: [0, 0],
        distance: 100,
        distanceDelta: GeolocusContext.DISTANCE_DELTA * 100,
        azimuth: GeolocusContext.DIRECTION_PARAM.N[0],
        azimuthDelta: GeolocusContext.DIRECTION_PARAM.N[1],
      },
    })
  })
})
