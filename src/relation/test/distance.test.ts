import { GEO_MAX_VALUE } from '../../math'
import { Distance } from '../distance'

describe('Test the Distance class', () => {
  test('SemanticDistance to EuclideanDistanceRange.', () => {
    expect(Distance.transformSemanticDistance('VN')).toEqual([0, 833])
    expect(Distance.transformSemanticDistance('N')).toEqual([833, 2500])
    expect(Distance.transformSemanticDistance('M')).toEqual([2500, 5000])
    expect(Distance.transformSemanticDistance('F')).toEqual([5000, 10000])
    expect(Distance.transformSemanticDistance('VF')).toEqual([
      10000,
      GEO_MAX_VALUE,
    ])
  })
})
