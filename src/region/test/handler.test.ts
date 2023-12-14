/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../../context'
import { GeolocusPointObject, GeolocusPolygonObject } from '../../object'
import { Direction } from '../../relation'
import { GeolocusBBox, IGeoRelation, Position2 } from '../../type'
import { Compare } from '../../util'
import { RegionResultHandler } from '../handler'

describe('Test some handler functions of Region', () => {
  test('Test the RegionResultHandler.topology function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const origin1 = GeolocusPolygonObject.fromBBox([-1, -1, 1, 1], context)
    const target = new GeolocusPointObject([0, 0], context)
    const relation: IGeoRelation[] = [
      'equal',
      'contain',
      'intersect',
      'touch',
      'disjoint',
    ].map((value) => {
      return {
        topology: value,
        direction: null,
        distance: null,
      } as IGeoRelation
    })

    // equal
    let topologyRegion = RegionResultHandler.topology(
      origin,
      relation[0],
      target,
    ).region
    let bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    // contain
    topologyRegion = RegionResultHandler.topology(
      origin,
      relation[1],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.0051) && Compare.LT(bbox[2], 0.0051))(),
    ).toBeTruthy()
    // intersect
    topologyRegion = RegionResultHandler.topology(
      origin,
      relation[2],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.0051) && Compare.LT(bbox[2], 0.0051))(),
    ).toBeTruthy()
    topologyRegion = RegionResultHandler.topology(
      origin1,
      relation[2],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -1.15) && Compare.LT(bbox[2], 1.15))(),
    ).toBeTruthy()
    // touch
    topologyRegion = RegionResultHandler.topology(
      origin,
      relation[3],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.0051) && Compare.LT(bbox[2], 0.0051))(),
    ).toBeTruthy()
    topologyRegion = RegionResultHandler.topology(
      origin1,
      relation[3],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -1.15) && Compare.LT(bbox[2], 1.15))(),
    ).toBeTruthy()
    // disjoint
    topologyRegion = RegionResultHandler.topology(
      origin,
      relation[4],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() =>
        Compare.EQ(bbox[0], -281474956479743) &&
        Compare.EQ(bbox[2], 281474956479743))(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfDistance function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)

    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    const pdf = RegionResultHandler.distance(origin, relation, target).pdf
    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfDirection function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: null,
    }

    const fuzzyRegion = Direction.computeRegion(origin, 'N')
    const topologyRegion = RegionResultHandler.direction(
      origin,
      relation,
      target,
    ).region
    expect(topologyRegion?.getBBox()).toEqual(fuzzyRegion.getBBox())
  })

  test('Test the topologyAndDirection function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)

    const relation: IGeoRelation[] = [
      'equal',
      'contain',
      'intersect',
      'touch',
      'disjoint',
    ].map((value) => {
      return {
        topology: value,
        direction: 'N',
        distance: null,
      } as IGeoRelation
    })

    // equal
    let topologyRegion = RegionResultHandler.topologyAndDirection(
      origin,
      relation[0],
      target,
    ).region
    let bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect(
      (() => Compare.GT(bbox[0], -0.051) && Compare.LT(bbox[2], 0.051))(),
    ).toBeTruthy()
    // contain
    topologyRegion = RegionResultHandler.topologyAndDirection(
      origin,
      relation[1],
      target,
    ).region
    let center = topologyRegion?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    // intersect
    topologyRegion = RegionResultHandler.topologyAndDirection(
      origin,
      relation[2],
      target,
    ).region
    center = topologyRegion?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    // touch
    topologyRegion = RegionResultHandler.topologyAndDirection(
      origin,
      relation[3],
      target,
    ).region
    center = topologyRegion?.getCenter() as Position2
    expect(
      (() => Compare.EQ(center[0], 0) && Compare.LT(center[1], 0.0251))(),
    ).toBeTruthy()
    // disjoint
    topologyRegion = RegionResultHandler.topologyAndDirection(
      origin,
      relation[4],
      target,
    ).region
    bbox = topologyRegion?.getBBox() as GeolocusBBox
    expect((() => Compare.EQ(bbox[1], 0))()).toBeTruthy()
  })

  test('Test the RegionResultHandler.topologyAndDistance function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)

    const relation: IGeoRelation = {
      topology: null,
      direction: null,
      distance: 100,
    }

    const pdf = RegionResultHandler.topologyAndDistance(
      origin,
      relation,
      target,
    ).pdf
    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfDirectionAndDistance function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    const pdf = RegionResultHandler.directionAndDistance(
      origin,
      relation,
      target,
    ).pdf
    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
  })

  test('Test the regionHandlerOfAll function', () => {
    const context = new GeolocusContext('test')
    const origin = new GeolocusPointObject([0, 0], context)
    const target = new GeolocusPointObject([0, 0], context)

    const relation: IGeoRelation = {
      topology: null,
      direction: 'N',
      distance: 100,
    }

    const pdf = RegionResultHandler.all(origin, relation, target).pdf

    expect(
      (() =>
        pdf.gdf.distanceDelta ===
        100 * origin.getContext()!.getDistanceDelta())(),
    ).toBeTruthy()
  })
})
