import { GEO_MAX_VALUE } from '../math'
import { GeolocusPolygonObject } from '../object'
import { Direction } from './direction'

describe('Test the Direction class', () => {
  test('Return the region by direction', () => {
    const object = GeolocusPolygonObject.fromBBox([0, 0, 1, 1])
    const region0 = Direction.computeRegion(object, 'ne')
    const region1 = Direction.computeRegion(object, 'sw')

    expect(region0.getBBox()).toEqual([1, 1, GEO_MAX_VALUE, GEO_MAX_VALUE])
    expect(region1.getBBox()).toEqual([-GEO_MAX_VALUE, -GEO_MAX_VALUE, 0, 0])
  })

  test('Return the error if the direction conflict', () => {
    const object = GeolocusPolygonObject.fromBBox([0, 0, 1, 1])
    expect(() => Direction.computeRegion(object, 'sn')).toThrow()
    expect(() => Direction.computeRegion(object, 'we')).toThrow()
  })
})
