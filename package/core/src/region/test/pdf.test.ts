import { GeolocusPointObject, GeolocusPolygonObject } from '@/object'
import { Compare } from '@/util'
import { describe, expect, test } from 'vitest'
import { RegionPDF } from '../pdf'
import { IRegionPDF } from '../type'

describe('Test the RegionPDF class', () => {
  test('Test the constant PDF', () => {
    const pdf = {
      type: 'constant',
      origin: new GeolocusPointObject([0, 0]),
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
    } as IRegionPDF

    expect(Compare.EQ(RegionPDF.computePDF(pdf, [1, 1]), 1)).toBeTruthy()
  })

  test('Test the distance PDF', () => {
    const pdf = {
      type: 'distance',
      origin: new GeolocusPointObject([0, 0]),
      gdf: {
        distance: 100,
        distanceDelta: 20,
        azimuth: null,
        azimuthDelta: null,
      },
    } as IRegionPDF

    expect(Compare.EQ(RegionPDF.computePDF(pdf, [100, 0]), 1)).toBeTruthy()
  })

  test('Test the angle PDF', () => {
    const pdf = {
      type: 'angle',
      origin: new GeolocusPointObject([0, 0]),
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: Math.PI / 4,
        azimuthDelta: Math.PI / 6,
      },
    } as IRegionPDF

    expect(Compare.EQ(RegionPDF.computePDF(pdf, [100, 100]), 1)).toBeTruthy()
  })

  test('Test the distanceAndAngle PDF', () => {
    const pdf = {
      type: 'distanceAndAngle',
      origin: new GeolocusPointObject([0, 0]),
      gdf: {
        distance: 100,
        distanceDelta: 20,
        azimuth: Math.PI / 4,
        azimuthDelta: Math.PI / 6,
      },
    } as IRegionPDF

    expect(
      Compare.EQ(
        RegionPDF.computePDF(pdf, [100 / Math.SQRT2, 100 / Math.SQRT2]),
        1,
      ),
    ).toBeTruthy()
  })

  test('Test the getUnsignedInternalDistanceField', () => {
    const pdf = {
      type: 'sdf',
      origin: new GeolocusPointObject([0, 0]),
      sdf: {
        girdRegion: new GeolocusPolygonObject([
          [
            [0, 0],
            [2, 0],
            [0, 2],
            [0, 0],
          ],
        ]),
        girdNum: 16,
      },
    } as IRegionPDF

    const gird = RegionPDF.computePDF(pdf)
    expect(
      Compare.EQ(gird[1][1], 2) && Compare.EQ(gird[1][2], Math.SQRT2),
    ).toBeTruthy()
  })
})
