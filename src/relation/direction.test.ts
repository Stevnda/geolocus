import { GEO_MAX_VALUE } from '../math'
import { Direction } from './direction'

describe('Test the Direction class', () => {
  test('Return the region by direction', () => {
    const region0 = Direction.computeRegion([0, 0, 1, 1], 'northEast')
    const region1 = Direction.computeRegion([0, 0, 1, 1], 'southWest')

    expect(region0).toEqual([1, 1, GEO_MAX_VALUE, GEO_MAX_VALUE])
    expect(region1).toEqual([-GEO_MAX_VALUE, -GEO_MAX_VALUE, 0, 0])
  })

  test('Return the error if the direction conflict', () => {
    expect(() => Direction.computeRegion([0, 0, 1, 1], 'southNorth')).toThrow()
    expect(() => Direction.computeRegion([0, 0, 1, 1], 'westEast')).toThrow()
  })
})
