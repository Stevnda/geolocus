import { GeolocusGlobalContext } from '@/context'
import { GEO_MAX_VALUE } from '@/util'
import { describe, expect, test } from 'vitest'
import { Distance } from '../distance'

describe('Test the Distance class', () => {
  test('TSemanticDistance to TEuclideanDistanceRange.', () => {
    const context = new GeolocusGlobalContext()
    expect(Distance.transformSemanticDistance('VN', context)).toEqual([0, 400])
    expect(Distance.transformSemanticDistance('N', context)).toEqual([
      400, 1000,
    ])
    expect(Distance.transformSemanticDistance('M', context)).toEqual([
      1000, 2500,
    ])
    expect(Distance.transformSemanticDistance('F', context)).toEqual([
      2500, 5000,
    ])
    expect(Distance.transformSemanticDistance('VF', context)).toEqual([
      5000,
      GEO_MAX_VALUE,
    ])
  })
})
