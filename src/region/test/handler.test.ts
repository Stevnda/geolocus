/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../../context'
import { Compare, GEO_MAX_VALUE } from '../../math'
import { GeolocusPointObject, GeolocusPolygonObject } from '../../object'
import { Direction } from '../../relation'
import { GeolocusBBox, IGeoRelation, Position2 } from '../../type'
import {
  regionHandlerOfAll,
  regionHandlerOfDirection,
  regionHandlerOfDirectionAndDistance,
  regionHandlerOfDistance,
  regionHandlerOfTopology,
  regionHandlerOfTopologyAndDirection,
  regionHandlerOfTopologyAndDistance,
} from '../handler'
import { IRegionResult } from '../type'

describe('Test some handler functions of Region', () => {
  test('Test the regionHandlerOfTopology function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    let result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
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
    regionHandlerOfTopology(origin, relation[0], target, result)
    let bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
    // contain
    regionHandlerOfTopology(origin, relation[1], target, result)
    bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
    // intersect
    regionHandlerOfTopology(origin, relation[2], target, result)
    bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
    // disjoint
    regionHandlerOfTopology(origin, relation[3], target, result)
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
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }

    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    regionHandlerOfDistance(origin, relation, target, result)
    result.pdf.forEach((value) => {
      expect(
        (() =>
          value.distanceDelta ===
          100 * origin.getContext()!.getDistanceDelta())(),
      ).toBeTruthy()
    })
  })

  test('Test the regionHandlerOfDirection function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: null,
    }

    const fuzzyRegion = Direction.computeRegion(origin, 'N')
    regionHandlerOfDirection(origin, relation, target, result)
    expect(result.region?.getBBox()).toEqual(fuzzyRegion.getBBox())
  })

  test('Test the regionHandlerOfTopologyAndDirection function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    let result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }

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
    regionHandlerOfTopologyAndDirection(origin, relation[0], target, result)
    let bbox = result.region?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
    // contain
    regionHandlerOfTopologyAndDirection(origin, relation[1], target, result)
    let center = result.region?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
    // intersect
    regionHandlerOfTopologyAndDirection(origin, relation[2], target, result)
    center = result.region?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    result = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }
    // disjoint
    regionHandlerOfTopologyAndDirection(origin, relation[3], target, result)
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
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }

    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    regionHandlerOfTopologyAndDistance(origin, relation, target, result)
    result.pdf.forEach((value) => {
      expect(
        (() =>
          value.distanceDelta ===
          100 * origin.getContext()!.getDistanceDelta())(),
      ).toBeTruthy()
    })
  })

  test('Test the regionHandlerOfDirectionAndDistance function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    regionHandlerOfDirectionAndDistance(origin, relation, target, result)
    result.pdf.forEach((value) => {
      expect(
        (() =>
          value.distanceDelta ===
          100 * origin.getContext()!.getDistanceDelta())(),
      ).toBeTruthy()
    })
  })

  test('Test the regionHandlerOfAll function', () => {
    const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ])
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)
    const result: IRegionResult = {
      region: MaxBBoxPolygon,
      pdf: [],
      coord: null,
      pdfGird: [],
      resultGird: null,
      mask: null,
    }

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    regionHandlerOfAll(origin, relation, target, result)
    result.pdf.forEach((value) => {
      expect(
        (() =>
          value.distanceDelta ===
          100 * origin.getContext()!.getDistanceDelta())(),
      ).toBeTruthy()
    })
  })
})
