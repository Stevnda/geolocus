import { Vector2 } from '../math'
import { GeolocusGird, Position2 } from '../type'
import { IRegionPDF } from './region.type'

export class RegionPDF {
  private static calculateNormalDistributionValue(
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

  private static calculateBivariateNormalDistributionValue(
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
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
  ) {
    console.log(origin)
    const x = Vector2.distanceTo(origin, target)

    return this.calculateNormalDistributionValue(x, distance, delta / 2)
  }

  private static angle(
    origin: Position2,
    target: Position2,
    azimuth: number,
    delta: number,
  ) {
    console.log(origin)
    const radiansTransform = -azimuth + Math.PI / 2
    const v1 = Vector2.sub(target, origin)
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]
    const radians = Vector2.angleTo(v1, v2)

    return this.calculateNormalDistributionValue(radians, 0, delta / 2)
  }

  private static distanceAndAngle(
    origin: Position2,
    target: Position2,
    distance: number,
    deltaDistance: number,
    azimuth: number,
    deltaAzimuth: number,
  ) {
    const x = Vector2.distanceTo(origin, target)

    const radiansTransform = -azimuth + Math.PI / 2
    const v1 = Vector2.sub(target, origin)
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]
    const radians = Vector2.angleTo(v1, v2)

    return this.calculateBivariateNormalDistributionValue(
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
    const resultGird: GeolocusGird = []
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mask = pdf.sdf.geolocusObject!.getMaskWithinBBox(pdf.sdf.girdNum!)

    for (let row = 0; row < mask.length; row++) {
      const temp = []
      for (let col = 0; col < mask[0].length; col++) {
        if (mask[row][col]) {
          temp.push(9999)
        } else {
          temp.push(0)
        }
      }
      resultGird.push(temp)
    }

    for (let row = 0; row < resultGird.length; row++) {
      for (let col = 0; col < resultGird[0].length; col++) {
        this.sdfCompare(resultGird, row, col, 0, -1)
        this.sdfCompare(resultGird, row, col, -1, 0)
        this.sdfCompare(resultGird, row, col, -1, -1)
        this.sdfCompare(resultGird, row, col, -1, 1)
      }
      for (let col = resultGird[0].length - 1; col >= 0; col--) {
        this.sdfCompare(resultGird, row, col, 0, 1)
      }
    }

    for (let row = resultGird.length - 1; row >= 0; row--) {
      for (let col = resultGird[0].length - 1; col >= 0; col--) {
        this.sdfCompare(resultGird, row, col, 0, 1)
        this.sdfCompare(resultGird, row, col, 1, 0)
        this.sdfCompare(resultGird, row, col, 1, -1)
        this.sdfCompare(resultGird, row, col, 1, 1)
      }
      for (let col = 0; col < resultGird[0].length; col++) {
        this.sdfCompare(resultGird, row, col, 0, -1)
      }
    }

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
    const map = {
      0: () => this.constant(),
      1: () =>
        this.distance(
          origin,
          target as Position2,
          pdf.gdf.distance as number,
          pdf.gdf.distanceDelta as number,
        ),
      2: () =>
        this.angle(
          origin,
          target as Position2,
          pdf.gdf.azimuth as number,
          pdf.gdf.azimuthDelta as number,
        ),
      3: () =>
        this.distanceAndAngle(
          origin,
          target as Position2,
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
