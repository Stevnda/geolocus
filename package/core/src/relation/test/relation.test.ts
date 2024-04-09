import { GeolocusGlobalContext } from '@/context'
import { GeolocusPointObject } from '@/object'
import { describe, expect, test } from 'vitest'

describe('Test Relation class', () => {
  test('Define the relation', () => {
    const context = new GeolocusGlobalContext()
    const origin0 = new GeolocusPointObject([0, 0], {
      context,
      bbox: null,
      center: null,
      geometry: null,
      name: null,
      status: null,
      type: null,
      uuid: null,
    })
    const origin1 = new GeolocusPointObject([10, 0], {
      context,
      bbox: null,
      center: null,
      geometry: null,
      name: null,
      status: null,
      type: null,
      uuid: null,
    })
    const target0 = new GeolocusPointObject([0, 0], {
      context,
      status: 'fuzzy',
      bbox: null,
      center: null,
      geometry: null,
      name: null,
      type: null,
      uuid: null,
    })
    const target1 = new GeolocusPointObject([0, 0], {
      status: 'fuzzy',
      context: null,
      bbox: null,
      center: null,
      geometry: null,
      name: null,
      type: null,
      uuid: null,
    })

    const relation = context.getRelation()
    relation.define(target0, origin0, {
      direction: 'W',
      distance: 100,
      topology: 'disjoint',
      context,
      semantic: null,
      weight: 1,
    })
    relation.define(target0, origin1, {
      direction: 'SW',
      distance: 100,
      topology: 'disjoint',
      context,
      semantic: null,
      weight: 1,
    })
    expect(
      relation.getRelationMapOfObjectByObjectUUID(target0.getUUID())?.size,
    ).toBe(2)
    expect(() => {
      relation.define(origin0, target0, {
        direction: 'E',
        distance: 100,
        topology: 'disjoint',
        context,
        semantic: null,
        weight: 1,
      })
    }).toThrow()
    expect(() => {
      relation.define(origin0, target1, {
        direction: 'E',
        distance: 100,
        topology: 'disjoint',
        context,
        semantic: null,
        weight: 1,
      })
    }).toThrow()
  })
})
