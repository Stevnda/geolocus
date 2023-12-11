/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../../context'
import { GeolocusPointObject, GeolocusPolygonObject } from '../../object'
import { Direction } from '../../relation'
import { GeolocusBBox, IGeoRelation, Position2 } from '../../type'
import { Compare, GEO_MAX_VALUE } from '../../util'
import {
  regionHandlerOfAll,
  regionHandlerOfDirection,
  regionHandlerOfDirectionAndDistance,
  regionHandlerOfDistance,
  regionHandlerOfTopology,
  regionHandlerOfTopologyAndDirection,
  regionHandlerOfTopologyAndDistance,
} from '../handler'

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
    const origin1 = GeolocusPolygonObject.fromBBox([-1, -1, 1, 1], context)
    const target = new GeolocusPointObject([0, 0], context)
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
    let topologyRegion = regionHandlerOfTopology(
      origin,
      relation[0],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    let bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    // contain
    topologyRegion = regionHandlerOfTopology(
      origin,
      relation[1],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.0051) && Compare.LT(bbox[2], 0.0051))(),
    ).toBeTruthy()
    // intersect
    topologyRegion = regionHandlerOfTopology(
      origin,
      relation[2],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.0051) && Compare.LT(bbox[2], 0.0051))(),
    ).toBeTruthy()
    topologyRegion = regionHandlerOfTopology(
      origin1,
      relation[2],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -1.15) && Compare.LT(bbox[2], 1.15))(),
    ).toBeTruthy()
    // disjoint
    topologyRegion = regionHandlerOfTopology(
      origin,
      relation[3],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    bbox = topologyRegion?.getBBox() as GeolocusBBox
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

    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    const pdf = regionHandlerOfDistance(
      origin,
      relation,
      target,
      MaxBBoxPolygon,
    ).topologyPDF
    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
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

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: null,
    }

    const fuzzyRegion = Direction.computeRegion(origin, 'N')
    const topologyRegion = regionHandlerOfDirection(
      origin,
      relation,
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    expect(topologyRegion?.getBBox()).toEqual(fuzzyRegion.getBBox())
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
    let topologyRegion = regionHandlerOfTopologyAndDirection(
      origin,
      relation[0],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    let bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    // contain
    topologyRegion = regionHandlerOfTopologyAndDirection(
      origin,
      relation[1],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    let center = topologyRegion?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    // intersect
    topologyRegion = regionHandlerOfTopologyAndDirection(
      origin,
      relation[2],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    center = topologyRegion?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    // disjoint
    topologyRegion = regionHandlerOfTopologyAndDirection(
      origin,
      relation[3],
      target,
      MaxBBoxPolygon,
    ).topologyRegion
    bbox = topologyRegion?.getBBox() as GeolocusBBox
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

    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    const pdf = regionHandlerOfTopologyAndDistance(
      origin,
      relation,
      target,
      MaxBBoxPolygon,
    ).topologyPDF
    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
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

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    const pdf = regionHandlerOfDirectionAndDistance(
      origin,
      relation,
      target,
      MaxBBoxPolygon,
    ).topologyPDF
    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
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

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    const pdf = regionHandlerOfAll(
      origin,
      relation,
      target,
      MaxBBoxPolygon,
    ).topologyPDF

    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
  })
})
