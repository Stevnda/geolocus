import { GeolocusContext } from '../context'
import { Compare, GEO_MAX_VALUE } from '../math'
import { GeolocusPointObject, GeolocusPolygonObject } from '../object'
import { Direction } from '../relation'
import { GeolocusBBox, IGeoRelation, Position2 } from '../type'
import {
  regionHandlerOfAll,
  regionHandlerOfDirection,
  regionHandlerOfDirectionAndDistance,
  regionHandlerOfDistance,
  regionHandlerOfTopology,
  regionHandlerOfTopologyAndDirection,
  regionHandlerOfTopologyAndDistance,
} from './handler'
import { IRegionResult } from './region.type'

describe('Test some handler functions of Region', () => {
  test('Test the regionHandlerOfTopology function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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

    // equal
    regionHandlerOfTopology(origin, relation[0], target, result, index)
    let bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // contain
    regionHandlerOfTopology(origin, relation[1], target, result, index)
    bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // intersect
    regionHandlerOfTopology(origin, relation[2], target, result, index)
    bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      PDF: [],
    }
    // disjoint
    regionHandlerOfTopology(origin, relation[3], target, result, index)
    bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() =>
        Compare.EQ(bbox[0], -281474956479743) &&
        Compare.EQ(bbox[2], 281474956479743))(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfDistance function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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

    regionHandlerOfDistance(origin, relation, target, result, index)
    expect(
      (() =>
        result.PDF[0].distanceDelta === 100 * GeolocusContext.DISTANCE_DELTA)(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfDirection function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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
    expect(result.region?.getBBox()).toEqual(fuzzyRegion.getBBox())
  })

  test('Test the regionHandlerOfTopologyAndDirection function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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

    // equal
    regionHandlerOfTopologyAndDirection(
      origin,
      relation[0],
      target,
      result,
      index,
    )
    let bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
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
    let center = result.region?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
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
    center = result.region?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
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
    bbox = result.region?.getBBox() as GeolocusBBox
    expect((() => Compare.EQ(bbox[1], 0))()).toBeTruthy()
  })

  test('Test the regionHandlerOfTopologyAndDistance function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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

    regionHandlerOfTopologyAndDistance(origin, relation, target, result, index)
    expect(
      (() =>
        result.PDF[0].distanceDelta === 100 * GeolocusContext.DISTANCE_DELTA)(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfDirectionAndDistance function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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
    expect(
      (() =>
        result.PDF[0].distanceDelta === 100 * GeolocusContext.DISTANCE_DELTA)(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfAll function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
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
    expect(
      (() =>
        result.PDF[0].distanceDelta === 100 * GeolocusContext.DISTANCE_DELTA)(),
    ).toBeTruthy()
  })
})
