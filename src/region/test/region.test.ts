/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '@/context'
import { GeolocusPointObject, createPolygonFromBBox } from '@/object'
import { describe, expect, test } from 'vitest'

describe('Test the Region class', () => {
  test('Return the result by uuid', () => {
    const context = new GeolocusContext()
    const origin0 = new GeolocusPointObject([0, 0], { context })
    const target0 = new GeolocusPointObject([0, 0], {
      context,
      status: 'fuzzy',
    })

    const region = context.getRegion()
    const relation = context.getRelation()

    relation.define(target0, origin0, {
      direction: 'E',
      distance: 60,
    })
    region.computeFuzzyObject(target0.getUUID(), {
      region: 'intersection',
      gird: 'multiply',
    })
    expect(region.getRegionResultByObjectUUID(origin0.getUUID())).toEqual(
      undefined,
    )
    expect(region.getRegionResultByObjectUUID(target0.getUUID())).toBeTruthy()
  })

  test('Compute the result property of Region class', () => {
    const context = new GeolocusContext()
    const origin0 = new GeolocusPointObject([0, 0], { context })
    const origin1 = createPolygonFromBBox([1, 1, 2, 2], { context })
    const init = {
      context,
      status: 'fuzzy',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    const target0 = new GeolocusPointObject([0, 0], init)
    const target1 = new GeolocusPointObject([0, 0], init)
    const target2 = new GeolocusPointObject([0, 0], init)
    const target3 = new GeolocusPointObject([0, 0], init)
    const target4 = new GeolocusPointObject([0, 0], init)
    const target5 = new GeolocusPointObject([0, 0], init)
    const target6 = new GeolocusPointObject([0, 0], init)

    const region = context.getRegion()
    const relation = context.getRelation()

    // validateFuzzy and compute order
    expect(() =>
      region.computeFuzzyObject(origin0.getUUID(), {
        region: 'intersection',
        gird: 'multiply',
      }),
    ).toThrow()
    expect(() =>
      region.computeFuzzyObject(target0.getUUID(), {
        region: 'intersection',
        gird: 'multiply',
      }),
    ).toThrow()
    // The geoRelation is null
    relation.define(target1, origin0, {})
    expect(() =>
      region.computeFuzzyObject(target1.getUUID(), {
        region: 'intersection',
        gird: 'multiply',
      }),
    ).toThrow()
    // The result region is null
    relation.define(target2, origin0, { direction: 'NE', distance: 100 })
    relation.define(target2, origin0, { direction: 'SW', distance: 100 })
    expect(() =>
      region.computeFuzzyObject(target2.getUUID(), {
        region: 'intersection',
        gird: 'multiply',
      }),
    ).toThrow()
    // gdf
    relation.define(target0, target3, {
      direction: 'E',
      distance: 60,
    })
    relation.define(target3, origin0, {
      topology: 'equal',
    })
    const uuid = region.computeFuzzyObject(target0.getUUID(), {
      region: 'intersection',
      gird: 'multiply',
    })
    expect(uuid.length).toBe(2)
    const x = region.getRegionResultByObjectUUID(target0.getUUID())!.coord![0]
    expect(x > 59 && x < 61).toBeTruthy()
    // sdf
    relation.define(target4, origin1, {
      topology: 'contain',
    })
    region.computeFuzzyObject(target4.getUUID(), {
      region: 'intersection',
      gird: 'multiply',
    })
    const sdfX = region.getRegionResultByObjectUUID(target4.getUUID())!
      .coord![0]
    expect(sdfX > 1.49 && sdfX < 1.51).toBeTruthy()

    // union
    relation.define(target5, origin0, {
      direction: 'E',
      distance: 60,
    })
    region.computeFuzzyObject(target5.getUUID(), {
      region: 'union',
      gird: 'add',
    })
    const unionX = region.getRegionResultByObjectUUID(target5.getUUID())!
      .coord![0]
    expect(unionX > 59 && unionX < 61).toBeTruthy()
    // the unboundedRegion is null
    relation.define(target6, origin0, {
      direction: 'E',
      distance: 60,
    })
    relation.define(target6, origin0, {
      direction: 'N',
      distance: 60,
    })
    relation.define(target6, origin1, {
      direction: 'SW',
    })
    expect(() =>
      region.computeFuzzyObject(target6.getUUID(), {
        region: 'intersection',
        gird: 'multiply',
      }),
    ).toThrow()
    region.computeFuzzyObject(target6.getUUID(), {
      region: 'union',
      gird: 'add',
    })
    expect(
      region.getRegionResultByObjectUUID(target5.getUUID())!.coord![0],
    ).toBeTruthy()
  })

  test('Get the gird of Region', () => {
    const context = new GeolocusContext()
    const target = new GeolocusPointObject([0, 0], {
      context,
      status: 'fuzzy',
    })

    const region = context.getRegion()
    expect(() =>
      region.computeRegionGrid(target.getUUID(), {
        region: 'intersection',
        gird: 'multiply',
      }),
    ).toThrow()
  })

  test('Get the coordinates of the maximum value.', () => {
    const context = new GeolocusContext()
    const target = new GeolocusPointObject([0, 0], {
      context,
      status: 'fuzzy',
    })

    const region = context.getRegion()
    expect(() => region.getCoordOfMaximum(target.getUUID())).toThrow()
  })
})
