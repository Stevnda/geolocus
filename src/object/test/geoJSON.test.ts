import { describe, expect, test } from 'vitest'
import { GeoJson } from '../geoJSON'
import { GeolocusGeometryFactory } from '../geometry'

describe('Test GeoJson', () => {
  test('parse the geojson', () => {
    const polygon = GeoJson.parse({
      type: 'Polygon',
      coordinates: [
        [
          [1, 131.001916959073],
          [26.362115842259524, 128.50396657766186],
          [50.74957979593943, 121.10611026571947],
          [1, 131.001916959073],
        ],
      ],
    })
    expect(polygon.getGeometryType()).toBe('Polygon')
  })

  test('Stringify the geojson', () => {
    const point = GeolocusGeometryFactory.point([1, 1])
    expect(GeoJson.stringify(point)).toBeInstanceOf(Object)
  })
})
