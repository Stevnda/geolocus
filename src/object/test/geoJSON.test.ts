import { Compare } from '../../math'
import { GeoJSON } from '../geoJSON'

describe('Test the GeoJSON class', () => {
  test('Return the GeoJSONPoint', () => {
    const point = GeoJSON.point([1, 1])
    expect(point.geometry.coordinates).toEqual([1, 1])
  })

  test('Return the GeoJSONLineString', () => {
    const line = GeoJSON.lineString([
      [1, 1],
      [1, 2],
    ])
    expect(line.geometry.coordinates).toEqual([
      [1, 1],
      [1, 2],
    ])
  })

  test('Return the Feature<Polygon>', () => {
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

  test('Return the Feature<Polygon> by bbox', () => {
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

  test('Translate the geoJSON', () => {
    const point = GeoJSON.point([0, 0])
    GeoJSON.translate(point, 10, Math.PI / 4)
    expect(
      Compare.EQ(GeoJSON.centerOfMass(point)[1], 10 / Math.SQRT2),
    ).toBeTruthy()
  })
})
