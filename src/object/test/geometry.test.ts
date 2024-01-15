import { GeolocusGeometryFactory } from '@/object'
import { describe, expect, test } from 'vitest'

describe('Test the GeolocusGeometryFactory class', () => {
  test('Return the point', () => {
    const point = GeolocusGeometryFactory.point([1, 1])
    expect(point.getGeometryType()).toBe('Point')
  })

  test('Return the lineString', () => {
    const line = GeolocusGeometryFactory.lineString([
      [1, 1],
      [1, 2],
    ])
    expect(line.getGeometryType()).toBe('LineString')
  })

  test('Return the polygon', () => {
    const polygon = GeolocusGeometryFactory.polygon([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    expect(polygon.getGeometryType()).toBe('Polygon')
  })

  test('Return the multiPoint', () => {
    const line = GeolocusGeometryFactory.multiPoint([
      [1, 1],
      [1, 2],
    ])
    expect(line.getGeometryType()).toBe('MultiPoint')
  })

  test('Return the multiLineString', () => {
    const line = GeolocusGeometryFactory.multiLineString([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    expect(line.getGeometryType()).toBe('MultiLineString')
  })

  test('Return the multiPolygon', () => {
    const line = GeolocusGeometryFactory.multiPolygon([
      [
        [
          [1, 1],
          [1, 2],
          [3, 3],
          [1, 1],
        ],
      ],
    ])
    expect(line.getGeometryType()).toBe('MultiPolygon')
  })
})
