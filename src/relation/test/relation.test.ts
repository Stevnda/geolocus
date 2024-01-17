import { GeolocusGlobalContext } from '@/context'
import { GeolocusPointObject } from '@/object'
import { describe, expect, test } from 'vitest'

describe('Test Relation class', () => {
  test('Define the relation', () => {
    const context = new GeolocusGlobalContext()
    const origin0 = new GeolocusPointObject([0, 0], { context })
    const origin1 = new GeolocusPointObject([10, 0], { context })
    const target0 = new GeolocusPointObject([0, 0], {
      context,
      status: 'fuzzy',
    })
    const target1 = new GeolocusPointObject([0, 0], { status: 'fuzzy' })

    const relation = context.getRelation()
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
    expect(
      relation.getRelationMapOfObjectByObjectUUID(target0.getUUID())?.size,
    ).toBe(2)
    expect(() => {
      relation.define(origin0, target0, {
        direction: 'E',
        distance: 100,
        topology: 'disjoint',
      })
    }).toThrow()
    expect(() => {
      relation.define(origin0, target1, {
        direction: 'E',
        distance: 100,
        topology: 'disjoint',
      })
    }).toThrow()
  })
})
