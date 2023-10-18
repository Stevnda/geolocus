import { Geometry } from './geometry'

describe('Test the Geometry class', () => {
  test('Return the GeolocusPointGeometry', () => {
    const point = Geometry.point([1, 1])
    expect(point.coordinates).toEqual([1, 1])
  })

  test('Return the GeolocusLineStringGeometry', () => {
    const line = Geometry.lineString([
      [1, 1],
      [1, 2],
    ])
    expect(line.coordinates).toEqual([
      [1, 1],
      [1, 2],
    ])
  })

  test('Return the GeolocusPolygonGeometry', () => {
    const polygon = Geometry.polygon([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    expect(polygon.coordinates).toEqual([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
  })

  test('Return the GeolocusPolygonGeometry by bbox', () => {
    const polygon = Geometry.bboxPolygon([1, 1, 3, 3])
    expect(polygon.coordinates).toEqual([
      [
        [1, 1],
        [3, 1],
        [3, 3],
        [1, 3],
        [1, 1],
      ],
    ])
  })

  test('Return the bbox of GeolocusGeometry', () => {
    const polygon = Geometry.polygon([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    expect(Geometry.bbox(polygon)).toEqual([1, 1, 3, 3])
  })
})
