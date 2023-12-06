/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '../../context'
import { GeolocusPointObject } from '../../object'

describe('Test the Region class', () => {
  test('Return the result by uuid', () => {
    const context = new GeolocusContext('test')
    const origin0 = new GeolocusPointObject([0, 0], context)
    const target0 = new GeolocusPointObject([0, 0], context, {
      fuzzy: true,
    })

    const region = context.getRegion()
    const relation = context.getRelation()

    relation.define(target0, origin0, {
      direction: 'E',
      distance: 60,
    })
    region.computeFuzzyObject(target0.getUUID())
    expect(region.getResultByUUID(origin0.getUUID())).toEqual(undefined)
    expect(region.getResultByUUID(target0.getUUID())).toBeTruthy()
  })

  test('Compute the result property of Region class', () => {
    const context = new GeolocusContext('test')
    const origin0 = new GeolocusPointObject([0, 0], context)
    const target0 = new GeolocusPointObject([0, 0], context, { fuzzy: true })
    const target1 = new GeolocusPointObject([0, 0], context, { fuzzy: true })
    const target2 = new GeolocusPointObject([0, 0], context, { fuzzy: true })
    const target3 = new GeolocusPointObject([0, 0], context, { fuzzy: true })

    const region = context.getRegion()
    const relation = context.getRelation()

    // validateFuzzy
    expect(() => region.computeFuzzyObject(origin0.getUUID())).toThrow()
    expect(() => region.computeFuzzyObject(target0.getUUID())).toThrow()

    relation.define(target1, origin0, {})
    expect(() => region.computeFuzzyObject(target1.getUUID())).toThrow()

    relation.define(target2, origin0, { direction: 'NE', distance: 100 })
    relation.define(target2, origin0, { direction: 'SW', distance: 100 })
    expect(() => region.computeFuzzyObject(target2.getUUID())).toThrow()

    relation.define(target0, target3, {
      direction: 'E',
      distance: 60,
    })
    relation.define(target3, origin0, {
      topology: 'equal',
    })
    const uuid = region.computeFuzzyObject(target0.getUUID())
    expect(uuid.length).toBe(2)
    const x = region.getResultByUUID(target0.getUUID())!.coord![0]
    expect(x > 59 && x < 61).toBeTruthy()
  })

  test('Get the gird of Region', () => {
    const context = new GeolocusContext('test')
    const target = new GeolocusPointObject([0, 0], context, { fuzzy: true })

    const region = context.getRegion()
    expect(() => region.getRegionGrid(target.getUUID())).toThrow()
  })

  test('Get the coordinates of the maximum value.', () => {
    const context = new GeolocusContext('test')
    const target = new GeolocusPointObject([0, 0], context, { fuzzy: true })

    const region = context.getRegion()
    expect(() => region.getCoordOfMaximum(target.getUUID())).toThrow()
  })
})
