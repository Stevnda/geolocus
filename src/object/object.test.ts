import { Geometry } from './geometry'
import {
  GeolocusLineStringObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'

describe('Test the GeolocusPointObject class', () => {
  test('Return the uuid', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getType()).toEqual('Point')
  })

  test('Return the vertex', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getVertex()).toEqual([1, 1])
  })

  test('Return the bbox', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getBBox()).toEqual([1, 1, 1, 1])
  })

  test('Return the geometry', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getGeometry()).toEqual(Geometry.point([1, 1]))
  })
})

describe('Test the GeolocusLineStringObject class', () => {
  test('Return the uuid', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getType()).toEqual('LineString')
  })

  test('Return the vertex', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getVertex()).toEqual([
      [1, 1],
      [1, 2],
    ])
  })

  test('Return the bbox', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getBBox()).toEqual([1, 1, 1, 2])
  })

  test('Return the geometry', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getGeometry()).toEqual(
      Geometry.lineString([
        [1, 1],
        [1, 2],
      ]),
    )
  })
})

describe('Test the GeolocusPolygonObject class', () => {
  test('Return the uuid', () => {
    const object = new GeolocusPolygonObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 1],
    ])
    expect(object.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const object = new GeolocusPolygonObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 1],
    ])
    expect(object.getType()).toEqual('Polygon')
  })

  test('Return the vertex', () => {
    const object = new GeolocusPolygonObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 1],
    ])
    expect(object.getVertex()).toEqual([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 1],
    ])
  })

  test('Return the bbox', () => {
    const object = new GeolocusPolygonObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 1],
    ])
    expect(object.getBBox()).toEqual([1, 1, 1, 3])
  })

  test('Return the geometry', () => {
    const object = new GeolocusPolygonObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 1],
    ])
    expect(object.getGeometry()).toEqual(
      Geometry.polygon([
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ]),
    )
  })
})
