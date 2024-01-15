/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Position2 } from '@/context'
import {
  GeolocusObject,
  GeolocusPointObject,
  computeGeolocusObjectMaskGrid,
} from '@/object'
import { Distance } from '@/relation'
import { GeolocusGird, Gird, Vector2 } from '@/util'
import { IRegionPDF } from './type'

export class RegionPDF {
  private static computeNormalDistributionValue(
    x: number,
    mean: number,
    std: number,
  ) {
    const exponent = (Math.pow(x - mean, 2) / Math.pow(std, 2)) * -0.5
    // const coefficient = 1 / (std * Math.sqrt(2 * Math.PI))
    // const result = coefficient * Math.exp(exponent)
    const result = Math.exp(exponent)

    return result
  }

  private static computeBivariateNormalDistributionValue(
    x: number,
    meanX: number,
    stdX: number,
    y: number,
    meanY: number,
    stdY: number,
  ) {
    const exponent =
      (Math.pow(x - meanX, 2) / Math.pow(stdX, 2) +
        Math.pow(y - meanY, 2) / Math.pow(stdY, 2)) *
      -0.5
    // const coefficient = 1 / (2 * Math.PI * stdX * stdY)
    // const result = coefficient * Math.exp(exponent)
    const result = Math.exp(exponent)

    return result
  }

  private static constant(): 1 {
    return 1
  }

  private static distance(
    origin: GeolocusObject,
    target: GeolocusPointObject,
    distance: number,
    delta: number,
  ) {
    const x = Distance.distance(origin, target)

    return this.computeNormalDistributionValue(x, distance, delta / 2)
  }

  private static angle(
    origin: GeolocusObject,
    target: GeolocusPointObject,
    azimuth: number,
    delta: number,
  ) {
    const radiansTransform = -azimuth + Math.PI / 2
    const v1 = Vector2.sub(target.getCenter(), origin.getCenter())
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]
    const radians = Vector2.angleTo(v1, v2)

    return this.computeNormalDistributionValue(radians, 0, delta / 2)
  }

  private static distanceAndAngle(
    origin: GeolocusObject,
    target: GeolocusPointObject,
    distance: number,
    deltaDistance: number,
    azimuth: number,
    deltaAzimuth: number,
  ) {
    const x = Distance.distance(target, origin)

    const radiansTransform = -azimuth + Math.PI / 2
    const v1 = Vector2.sub(target.getCenter(), origin.getCenter())
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]
    const radians = Vector2.angleTo(v1, v2)

    return this.computeBivariateNormalDistributionValue(
      x,
      distance,
      deltaDistance / 2,
      radians,
      0,
      deltaAzimuth / 2,
    )
  }

  private static sdfCompare(
    gird: GeolocusGird,
    originRow: number,
    originCol: number,
    rowOffset: number,
    colOffset: number,
  ) {
    const row = gird.length
    const col = gird[0].length
    let other = 9999
    const targetRow = originRow + rowOffset
    const targetCol = originCol + colOffset
    if (targetRow >= 0 && targetCol > 0 && targetRow < row && targetCol < col) {
      other = gird[targetRow][targetCol]
    }

    const compareValue =
      other + Vector2.distanceTo([0, 0], [rowOffset, colOffset])
    if (gird[originRow][originCol] > compareValue) {
      gird[originRow][originCol] = compareValue
    }
  }

  private static getUnsignedInternalDistanceField(pdf: IRegionPDF) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mask = computeGeolocusObjectMaskGrid(
      pdf.sdf.girdRegion!,
      pdf.sdf.girdNum!,
    )
    const tempGird = Gird.createGirdWithFilter(
      mask.length + 4,
      mask[0].length + 4,
      (row, col) => {
        if (
          row <= 1 ||
          col <= 1 ||
          row >= mask.length + 2 ||
          col >= mask[0].length + 2
        ) {
          return 0
        } else {
          return mask[row - 2][col - 2] ? 9999 : 0
        }
      },
    )

    for (let row = 0; row < tempGird.length; row++) {
      for (let col = 0; col < tempGird[0].length; col++) {
        this.sdfCompare(tempGird, row, col, 0, -1)
        this.sdfCompare(tempGird, row, col, -1, 0)
        this.sdfCompare(tempGird, row, col, -1, -1)
        this.sdfCompare(tempGird, row, col, -1, 1)
      }
      for (let col = tempGird[0].length - 1; col >= 0; col--) {
        this.sdfCompare(tempGird, row, col, 0, 1)
      }
    }

    for (let row = tempGird.length - 1; row >= 0; row--) {
      for (let col = tempGird[0].length - 1; col >= 0; col--) {
        this.sdfCompare(tempGird, row, col, 0, 1)
        this.sdfCompare(tempGird, row, col, 1, 0)
        this.sdfCompare(tempGird, row, col, 1, -1)
        this.sdfCompare(tempGird, row, col, 1, 1)
      }
      for (let col = 0; col < tempGird[0].length; col++) {
        this.sdfCompare(tempGird, row, col, 0, -1)
      }
    }

    const resultGird = Gird.createGirdWithFilter(
      mask.length,
      mask[0].length,
      (row, col) => {
        return tempGird[row + 2][col + 2]
      },
    )

    return resultGird
  }

  static computePDF(pdf: IRegionPDF): GeolocusGird
  static computePDF(pdf: IRegionPDF, target: Position2): number
  static computePDF(
    pdf: IRegionPDF,
    target?: Position2,
  ): number | GeolocusGird {
    const type = pdf.type
    const origin = pdf.origin
    const targetPoint = target && new GeolocusPointObject(target)
    const map = {
      0: () => this.constant(),
      1: () =>
        this.distance(
          origin,
          targetPoint as GeolocusPointObject,
          pdf.gdf.distance as number,
          pdf.gdf.distanceDelta as number,
        ),
      2: () =>
        this.angle(
          origin,
          targetPoint as GeolocusPointObject,
          pdf.gdf.azimuth as number,
          pdf.gdf.azimuthDelta as number,
        ),
      3: () =>
        this.distanceAndAngle(
          origin,
          targetPoint as GeolocusPointObject,
          pdf.gdf.distance as number,
          pdf.gdf.distanceDelta as number,
          pdf.gdf.azimuth as number,
          pdf.gdf.azimuthDelta as number,
        ),
      4: () => this.getUnsignedInternalDistanceField(pdf),
    }

    return map[type]()
  }
}
