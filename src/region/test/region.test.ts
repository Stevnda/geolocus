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

    const region = context.getRegion()
    const relation = context.getRelation()

    expect(() => region.computeFuzzyObject(origin0.getUUID())).toThrow()
    expect(() => region.computeFuzzyObject(target0.getUUID())).toThrow()
    relation.define(target0, target1, {
      direction: 'E',
      distance: 60,
    })
    expect(() => region.computeFuzzyObject(target0.getUUID())).toThrow()
    relation.define(target1, origin0, {
      topology: 'equal',
    })
    const uuid = region.computeFuzzyObject(target0.getUUID())
    expect(uuid.length).toBe(2)
    const x = region.getResultByUUID(target0.getUUID())!.coord![0]
    expect(x > 59 && x < 61).toBeTruthy()
  })

  // test('Get the membership value of coordinate', () => {
  //   const origin0 = new GeolocusPointObject([0, 0])
  //   const target0 = new GeolocusPointObject([0, 0])
  //   const triple0: IGeoTriple = {
  //     origin: origin0.getUUID(),
  //     relation: {
  //       direction: 'NE',
  //       distance: 100,
  //       topology: 'disjoint',
  //     },
  //     target: target0.getUUID(),
  //   }
  //   const region0 = new Region([triple0])
  //   region0.computeResult()
  //   expect(() =>
  //     Compare.EQ(
  //       region0.getMembershipOfPoint([100 / Math.SQRT2, 100 / Math.SQRT2]),
  //       1,
  //     ),
  //   ).toBeTruthy()
  // })

  // test('Get the membership grid of selected bbox', () => {
  //   const origin0 = new GeolocusPointObject([0, 0])
  //   const target0 = new GeolocusPointObject([0, 0])
  //   const triple0: IGeoTriple = {
  //     origin: origin0.getUUID(),
  //     relation: {
  //       direction: 'NE',
  //       distance: 100,
  //       topology: 'disjoint',
  //     },
  //     target: target0.getUUID(),
  //   }
  //   const region0 = new Region([triple0])
  //   region0.computeResult()
  //   expect(region0.getMembershipGridOfBBox([0, 0, 1, 1]))
  // })

  // test('Get the membership grid of Region ', () => {
  //   const origin0 = new GeolocusPointObject([0, 0])
  //   const target0 = new GeolocusPointObject([0, 0])
  //   const triple0: IGeoTriple = {
  //     origin: origin0.getUUID(),
  //     relation: {
  //       direction: 'NE',
  //       distance: 70,
  //       topology: 'disjoint',
  //     },
  //     target: target0.getUUID(),
  //   }
  //   const origin1 = new GeolocusPointObject([100, 100])
  //   const target1 = new GeolocusPointObject([0, 0])
  //   const triple1: IGeoTriple = {
  //     origin: origin1.getUUID(),
  //     relation: {
  //       direction: 'SW',
  //       distance: 70,
  //       topology: 'disjoint',
  //     },
  //     target: target1.getUUID(),
  //   }

  //   const region0 = new Region([triple0, triple1])
  //   region0.computeResult()
  //   expect(region0.getMembershipGridOfRegion())

  //   const region1 = new Region([triple0, triple1])
  //   expect(() => region1.getMembershipGridOfRegion()).toThrow()
  // })

  // test('Get the coordinates which their membership value are more than selected value', () => {
  //   const origin0 = new GeolocusPointObject([0, 0])
  //   const target0 = new GeolocusPointObject([0, 0])
  //   const triple0: IGeoTriple = {
  //     origin: origin0.getUUID(),
  //     relation: {
  //       direction: 'NE',
  //       distance: 100,
  //       topology: 'disjoint',
  //     },
  //     target: target0.getUUID(),
  //   }

  //   const region0 = new Region([triple0])
  //   expect(() => region0.getCoordOfMaxMembershipValue([[]])).toThrow()
  //   region0.computeResult()
  //   const result = region0.getMembershipGridOfRegion()
  //   const values = region0.getCoordOfMaxMembershipValue(result.gird, 0.99)
  //   expect(values)
  // })
})
