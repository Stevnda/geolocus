import { Compare } from '../math'
import { RegionPDF } from './pdf'
import { IRegionPDF } from './region'

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

    expect(Compare.EQ(RegionPDF.computePDF(pdf, [1, 1]), 1)).toBeTruthy()
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

    expect(Compare.EQ(RegionPDF.computePDF(pdf, [100, 0]), 1)).toBeTruthy()
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

    expect(Compare.EQ(RegionPDF.computePDF(pdf, [100, 100]), 1)).toBeTruthy()
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

    expect(
      Compare.EQ(
        RegionPDF.computePDF(pdf, [100 / Math.SQRT2, 100 / Math.SQRT2]),
        1,
      ),
    ).toBeTruthy()
  })
})
