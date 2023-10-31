import { GeoJSON } from './geoJSON'

describe('Test the GeoJSON class', () => {
  test('Return the GeolocusPointGeoJSON', () => {
    const point = GeoJSON.point([1, 1])
    expect(point.geometry.coordinates).toEqual([1, 1])
  })

  test('Return the GeolocusLineStringGeoJSON', () => {
    const line = GeoJSON.lineString([
      [1, 1],
      [1, 2],
    ])
    expect(line.geometry.coordinates).toEqual([
      [1, 1],
      [1, 2],
    ])
  })

  test('Return the GeolocusPolygonGeoJSON', () => {
    const polygon = GeoJSON.polygon([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    expect(polygon.geometry.coordinates).toEqual([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
  })

  test('Return the GeolocusPolygonGeoJSON by bbox', () => {
    const polygon = GeoJSON.bboxPolygon([1, 1, 3, 3])
    expect(polygon.geometry.coordinates).toEqual([
      [
        [1, 1],
        [3, 1],
        [3, 3],
        [1, 3],
        [1, 1],
      ],
    ])
  })

  test('Return the bbox of GeolocusGeoJSON', () => {
    const polygon = GeoJSON.polygon([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    expect(GeoJSON.bbox(polygon)).toEqual([1, 1, 3, 3])
  })
})
