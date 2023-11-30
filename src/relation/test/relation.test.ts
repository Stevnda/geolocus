import { GeolocusContext } from '../../context'
import { GeolocusPointObject } from '../../object'

describe('Test Relation class', () => {
  test('Define the relation', () => {
    const origin0 = new GeolocusPointObject([0, 0])
    const origin1 = new GeolocusPointObject([10, 0])
    const origin2 = new GeolocusPointObject([10, 0], true)
    const target0 = new GeolocusPointObject([0, 0], true)
    const target1 = new GeolocusPointObject([0, 0], true)

    const relation = GeolocusContext.getRelation()
    relation.define(target0, origin0, {
      direction: 'W',
      distance: 100,
      topology: 'disjoint',
    })
    relation.define(target0, origin1, {
      direction: 'SW',
      distance: 100,
      topology: 'disjoint',
    })
    expect(relation.getGeoTripleByUUID(target0.getUUID())?.size).toBe(2)
    expect(() => {
      relation.define(target1, origin2, {
        direction: 'E',
        distance: 100,
        topology: 'disjoint',
      })
    }).toThrow()
    expect(() => {
      relation.define(origin0, target0, {
        direction: 'E',
        distance: 100,
        topology: 'disjoint',
      })
    }).toThrow()
  })
})
