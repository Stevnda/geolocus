import { createPolygonFromBBox } from '@/object'
import { Position2 } from '@/type'
import { Compare, GEO_MAX_VALUE } from '@/util'
import { describe, expect, test } from 'vitest'
import { Direction } from '../direction'

describe('Test the Direction class', () => {
  test('Computes the azimuth of vector', () => {
    const v1: Position2 = [1, 0]
    const v2: Position2 = [-1, 1]

    const result1 = Direction.azimuth(v1)
    const result2 = Direction.azimuth(v2)
    expect(() => Compare.EQ(result1, 0)).toBeTruthy()
    expect(() => Compare.EQ(result2, (Math.PI / 4) * 7)).toBeTruthy()
  })

  test('Return the region by direction', () => {
    const object = createPolygonFromBBox([0, 0, 1, 1])
    const region0 = Direction.computeRegion(object, 'ne')
    const region1 = Direction.computeRegion(object, 'sw')

    expect(region0.getBBox()).toEqual([1, 1, GEO_MAX_VALUE, GEO_MAX_VALUE])
    expect(region1.getBBox()).toEqual([-GEO_MAX_VALUE, -GEO_MAX_VALUE, 0, 0])
  })

  test('Return the error if the direction conflict', () => {
    const object = createPolygonFromBBox([0, 0, 1, 1])
    expect(() => Direction.computeRegion(object, 'sn')).toThrow()
    expect(() => Direction.computeRegion(object, 'we')).toThrow()
  })
})
