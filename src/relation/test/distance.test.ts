import { GeolocusContext } from '../../context'
import { GEO_MAX_VALUE } from '../../util'
import { Distance } from '../distance'

describe('Test the Distance class', () => {
  test('SemanticDistance to EuclideanDistanceRange.', () => {
    const context = new GeolocusContext('test')
    expect(Distance.transformSemanticDistance('VN', context)).toEqual([0, 833])
    expect(Distance.transformSemanticDistance('N', context)).toEqual([
      833, 2500,
    ])
    expect(Distance.transformSemanticDistance('M', context)).toEqual([
      2500, 5000,
    ])
    expect(Distance.transformSemanticDistance('F', context)).toEqual([
      5000, 10000,
    ])
    expect(Distance.transformSemanticDistance('VF', context)).toEqual([
      10000,
      GEO_MAX_VALUE,
    ])
  })
})
