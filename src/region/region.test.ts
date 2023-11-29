import { Compare } from '../math'
import { GeolocusPointObject } from '../object'
import { IGeoTriple } from '../type'
import { Region } from './region'

describe('Test the Region class', () => {
  test('Compute the result property of Region class', () => {
    const origin0 = new GeolocusPointObject([0, 0])
    const target0 = new GeolocusPointObject([0, 0])
    const triple0: IGeoTriple = {
      origin: origin0.getUUID(),
      relation: {
        direction: 'NE',
        distance: 100,
        topology: 'disjoint',
      },
      target: target0.getUUID(),
    }
    const origin1 = new GeolocusPointObject([-70, 0])
    const target1 = new GeolocusPointObject([0, 0])
    const triple1: IGeoTriple = {
      origin: origin1.getUUID(),
      relation: {
        direction: 'W',
        distance: 100,
        topology: 'disjoint',
      },
      target: target1.getUUID(),
    }
    const origin2 = new GeolocusPointObject([-70, 0])
    const target2 = new GeolocusPointObject([0, 0])
    const triple2: IGeoTriple = {
      origin: origin2.getUUID(),
      relation: {
        direction: null,
        distance: null,
        topology: null,
      },
      target: target2.getUUID(),
    }

    const region0 = new Region([triple0])
    expect(() => region0.computeResult())
    const region1 = new Region([triple0, triple1])
    expect(() => region1.computeResult()).toThrow()
    const region2 = new Region([triple2])
    expect(() => region2.computeResult()).toThrow()
  })

  test('Get the membership value of coordinate', () => {
    const origin0 = new GeolocusPointObject([0, 0])
    const target0 = new GeolocusPointObject([0, 0])
    const triple0: IGeoTriple = {
      origin: origin0.getUUID(),
      relation: {
        direction: 'NE',
        distance: 100,
        topology: 'disjoint',
      },
      target: target0.getUUID(),
    }
    const region0 = new Region([triple0])
    region0.computeResult()
    expect(() =>
      Compare.EQ(
        region0.getMembershipOfPoint([100 / Math.SQRT2, 100 / Math.SQRT2]),
        1,
      ),
    ).toBeTruthy()
  })

  test('Get the membership grid of selected bbox', () => {
    const origin0 = new GeolocusPointObject([0, 0])
    const target0 = new GeolocusPointObject([0, 0])
    const triple0: IGeoTriple = {
      origin: origin0.getUUID(),
      relation: {
        direction: 'NE',
        distance: 100,
        topology: 'disjoint',
      },
      target: target0.getUUID(),
    }
    const region0 = new Region([triple0])
    region0.computeResult()
    expect(region0.getMembershipGridOfBBox([0, 0, 1, 1]))
  })

  test('Get the membership grid of Region ', () => {
    const origin0 = new GeolocusPointObject([0, 0])
    const target0 = new GeolocusPointObject([0, 0])
    const triple0: IGeoTriple = {
      origin: origin0.getUUID(),
      relation: {
        direction: 'NE',
        distance: 70,
        topology: 'disjoint',
      },
      target: target0.getUUID(),
    }
    const origin1 = new GeolocusPointObject([100, 100])
    const target1 = new GeolocusPointObject([0, 0])
    const triple1: IGeoTriple = {
      origin: origin1.getUUID(),
      relation: {
        direction: 'SW',
        distance: 70,
        topology: 'disjoint',
      },
      target: target1.getUUID(),
    }

    const region0 = new Region([triple0, triple1])
    region0.computeResult()
    expect(region0.getMembershipGridOfRegion())

    const region1 = new Region([triple0, triple1])
    expect(() => region1.getMembershipGridOfRegion()).toThrow()
  })

  test('Get the coordinates which their membership value are more than selected value', () => {
    const origin0 = new GeolocusPointObject([0, 0])
    const target0 = new GeolocusPointObject([0, 0])
    const triple0: IGeoTriple = {
      origin: origin0.getUUID(),
      relation: {
        direction: 'NE',
        distance: 100,
        topology: 'disjoint',
      },
      target: target0.getUUID(),
    }

    const region0 = new Region([triple0])
    expect(() => region0.getCoordOfMaxMembershipValue([[]])).toThrow()
    region0.computeResult()
    const result = region0.getMembershipGridOfRegion()
    const values = region0.getCoordOfMaxMembershipValue(result.gird, 0.99)
    expect(values)
  })
})
