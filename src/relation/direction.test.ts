import { GEO_MAX_VALUE } from '../math'
import { GeolocusLineStringObject } from '../object'
import { Direction } from './direction'

describe('Test the Direction class', () => {
  test('Return the region by direction', () => {
    const line = new GeolocusLineStringObject([
      [0, 0],
      [1, 1],
    ])

    const region0 = Direction.computeRegion(line, 'northEast')
    const region1 = Direction.computeRegion(line, 'southWest')

    expect(region0).toEqual([1, 1, GEO_MAX_VALUE, GEO_MAX_VALUE])
    expect(region1).toEqual([-GEO_MAX_VALUE, -GEO_MAX_VALUE, 0, 0])
  })

  test('Return the error if the direction conflict', () => {
    const line = new GeolocusLineStringObject([
      [0, 0],
      [1, 1],
    ])

    expect(() => Direction.computeRegion(line, 'southNorth')).toThrow()
    expect(() => Direction.computeRegion(line, 'westEast')).toThrow()
  })
})
