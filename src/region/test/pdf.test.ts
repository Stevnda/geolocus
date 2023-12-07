import { Compare } from '../../math'
import { RegionPDF } from '../pdf'
import { IRegionPDF, IRegionResult } from '../type'

describe('Test the RegionPDF class', () => {
  test('Test the constant PDF', () => {
    const pdf: IRegionPDF = {
      type: 0,
      origin: [0, 0],
      distance: null,
      distanceDelta: null,
      azimuth: null,
      azimuthDelta: null,
    }
    const result = {}

    expect(
      Compare.EQ(RegionPDF.computePDF(pdf, result as IRegionResult, [1, 1]), 1),
    ).toBeTruthy()
  })

  test('Test the distance PDF', () => {
    const pdf: IRegionPDF = {
      type: 1,
      origin: [0, 0],
      distance: 100,
      distanceDelta: 20,
      azimuth: null,
      azimuthDelta: null,
    }
    const result = {}

    expect(
      Compare.EQ(
        RegionPDF.computePDF(pdf, result as IRegionResult, [100, 0]),
        1,
      ),
    ).toBeTruthy()
  })

  test('Test the angle PDF', () => {
    const pdf: IRegionPDF = {
      type: 2,
      origin: [0, 0],
      distance: null,
      distanceDelta: null,
      azimuth: Math.PI / 4,
      azimuthDelta: Math.PI / 6,
    }
    const result = {}

    expect(
      Compare.EQ(
        RegionPDF.computePDF(pdf, result as IRegionResult, [100, 100]),
        1,
      ),
    ).toBeTruthy()
  })

  test('Test the distanceAndAngle PDF', () => {
    const pdf: IRegionPDF = {
      type: 3,
      origin: [0, 0],
      distance: 100,
      distanceDelta: 20,
      azimuth: Math.PI / 4,
      azimuthDelta: Math.PI / 6,
    }
    const result = {}

    expect(
      Compare.EQ(
        RegionPDF.computePDF(pdf, result as IRegionResult, [
          100 / Math.SQRT2,
          100 / Math.SQRT2,
        ]),
        1,
      ),
    ).toBeTruthy()
  })
})
