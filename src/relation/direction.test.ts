import { BBoxGeometry } from '../geometry'
import { GEO_MAX_VALUE } from '../math'
import { Direction } from './direction'

describe('Test the Direction class', () => {
  test('Return the region by direction', () => {
    const bbox = new BBoxGeometry([0, 0], [1, 1])

    const region0 = Direction.computeRegion(bbox, 'northEast')
    const region1 = Direction.computeRegion(bbox, 'southWest')

    expect(region0).toEqual([
      [1, 1],
      [GEO_MAX_VALUE, GEO_MAX_VALUE],
    ])
    expect(region1).toEqual([
      [-GEO_MAX_VALUE, -GEO_MAX_VALUE],
      [0, 0],
    ])
  })

  test('Return the error if the direction conflict', () => {
    const bbox = new BBoxGeometry([0, 0], [1, 1])

    expect(() => Direction.computeRegion(bbox, 'southNorth')).toThrow()
    expect(() => Direction.computeRegion(bbox, 'westEast')).toThrow()
  })
})
