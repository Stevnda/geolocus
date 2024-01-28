import { describe, expect, test } from 'vitest'
import {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'

describe('Test GeolocusPointObject', () => {
  test('Init', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point).toBeInstanceOf(GeolocusPointObject)
  })

  test('Get geolocusContext', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getContext()).toBeNull()
  })

  test('Get uuid', () => {
    const point = new GeolocusPointObject([0, 0])
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    expect(point.getUUID()).toMatch(uuidRegex)
  })

  test('Get type', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getType()).toBe('Point')
  })

  test('Get status', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getStatus()).toBe('precise')
  })

  test('Get name', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getName()).toBe('')
  })

  test('Get geometry', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getGeometry().getGeometryType()).toBe('Point')
  })

  test('Get bbox', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getBBox()).toEqual([0, 0, 0, 0])
  })

  test('Get center', () => {
    const point = new GeolocusPointObject([0, 0])
    expect(point.getCenter()).toEqual([0, 0])
  })
})

describe('Test GeolocusLineStringObject', () => {
  test('Init', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString).toBeInstanceOf(GeolocusLineStringObject)
  })

  test('Get geolocusContext', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getContext()).toBeNull()
  })

  test('Get uuid', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    expect(LineString.getUUID()).toMatch(uuidRegex)
  })

  test('Get type', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getType()).toBe('LineString')
  })

  test('Get status', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getStatus()).toBe('precise')
  })

  test('Get name', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getName()).toBe('')
  })

  test('Get geometry', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getGeometry().getGeometryType()).toBe('LineString')
  })

  test('Get bbox', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getBBox()).toEqual([0, 0, 0, 0])
  })

  test('Get center', () => {
    const LineString = new GeolocusLineStringObject([
      [0, 0],
      [0, 0],
    ])
    expect(LineString.getCenter()).toEqual([0, 0])
  })
})

describe('Test GeolocusPolygonObject', () => {
  test('Init', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon).toBeInstanceOf(GeolocusPolygonObject)
  })

  test('Get geolocusContext', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getContext()).toBeNull()
  })

  test('Get uuid', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    expect(Polygon.getUUID()).toMatch(uuidRegex)
  })

  test('Get type', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getType()).toBe('Polygon')
  })

  test('Get status', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getStatus()).toBe('precise')
  })

  test('Get name', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getName()).toBe('')
  })

  test('Get geometry', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getGeometry().getGeometryType()).toBe('Polygon')
  })

  test('Get bbox', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getBBox()).toEqual([0, 0, 3, 3])
  })

  test('Get center', () => {
    const Polygon = new GeolocusPolygonObject([
      [
        [0, 0],
        [3, 0],
        [0, 3],
        [0, 0],
      ],
    ])
    expect(Polygon.getCenter()).toEqual([1, 1])
  })
})

describe('Test GeolocusMultiPointObject', () => {
  test('Init', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint).toBeInstanceOf(GeolocusMultiPointObject)
  })

  test('Get geolocusContext', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getContext()).toBeNull()
  })

  test('Get uuid', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    expect(MultiPoint.getUUID()).toMatch(uuidRegex)
  })

  test('Get type', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getType()).toBe('MultiPoint')
  })

  test('Get status', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getStatus()).toBe('precise')
  })

  test('Get name', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getName()).toBe('')
  })

  test('Get geometry', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getGeometry().getGeometryType()).toBe('MultiPoint')
  })

  test('Get bbox', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getBBox()).toEqual([0, 0, 0, 0])
  })

  test('Get center', () => {
    const MultiPoint = new GeolocusMultiPointObject([
      [0, 0],
      [0, 0],
    ])
    expect(MultiPoint.getCenter()).toEqual([0, 0])
  })
})

describe('Test GeolocusMultiLineStringObject', () => {
  test('Init', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString).toBeInstanceOf(GeolocusMultiLineStringObject)
  })

  test('Get geolocusContext', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getContext()).toBeNull()
  })

  test('Get uuid', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    expect(MultiLineString.getUUID()).toMatch(uuidRegex)
  })

  test('Get type', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getType()).toBe('MultiLineString')
  })

  test('Get status', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getStatus()).toBe('precise')
  })

  test('Get name', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getName()).toBe('')
  })

  test('Get geometry', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getGeometry().getGeometryType()).toBe(
      'MultiLineString',
    )
  })

  test('Get bbox', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getBBox()).toEqual([0, 0, 0, 0])
  })

  test('Get center', () => {
    const MultiLineString = new GeolocusMultiLineStringObject([
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ])
    expect(MultiLineString.getCenter()).toEqual([0, 0])
  })
})

describe('Test GeolocusMultiPolygonObject', () => {
  test('Init', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon).toBeInstanceOf(GeolocusMultiPolygonObject)
  })

  test('Get geolocusContext', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getContext()).toBeNull()
  })

  test('Get uuid', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    expect(MultiPolygon.getUUID()).toMatch(uuidRegex)
  })

  test('Get type', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getType()).toBe('MultiPolygon')
  })

  test('Get status', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getStatus()).toBe('precise')
  })

  test('Get name', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getName()).toBe('')
  })

  test('Get geometry', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getGeometry().getGeometryType()).toBe('MultiPolygon')
  })

  test('Get bbox', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getBBox()).toEqual([0, 0, 3, 3])
  })

  test('Get center', () => {
    const MultiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [0, 0],
          [3, 0],
          [0, 3],
          [0, 0],
        ],
      ],
    ])
    expect(MultiPolygon.getCenter()).toEqual([1, 1])
  })
})
