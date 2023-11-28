import { Vector2 } from '../math'
import { Position2 } from '../type'
import { IRegionPDF } from './type'

// interface IGetRegionPDF {
//   0: () => 1
//   1: (
//     origin: Position2,
//     target: Position2,
//     distance: number,
//     delta: number,
//   ) => number
//   2: (origin: Position2, target: Position2, azimuth: number) => number
//   3: (
//     origin: Position2,
//     target: Position2,
//     distance: number,
//     delta: number,
//     azimuth: number,
//   ) => number
// }

export class RegionPDF {
  private static calculateNormalDistributionValue(
    x: number,
    mean: number,
    std: number,
  ) {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2))
    const coefficient = 1 / (std * Math.sqrt(2 * Math.PI))
    const result = (coefficient * Math.exp(exponent)) / coefficient

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
    const coefficient = 1 / (2 * Math.PI * stdX * stdY)
    const result = (coefficient * Math.exp(exponent)) / coefficient

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
    const x = Vector2.distanceTo(origin, target)

    return this.calculateNormalDistributionValue(x, distance, delta / 2)
  }

  private static angle(
    origin: Position2,
    target: Position2,
    azimuth: number,
    delta: number,
  ) {
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

  static computePDF(pdf: IRegionPDF, target: Position2) {
    const type = pdf.type
    const origin = pdf.origin
    const map = {
      0: () => this.constant(),
      1: () =>
        this.distance(
          origin,
          target,
          pdf.distance as number,
          pdf.distanceDelta as number,
        ),
      2: () =>
        this.angle(
          origin,
          target,
          pdf.azimuth as number,
          pdf.azimuthDelta as number,
        ),
      3: () =>
        this.distanceAndAngle(
          origin,
          target,
          pdf.distance as number,
          pdf.distanceDelta as number,
          pdf.azimuth as number,
          pdf.azimuthDelta as number,
        ),
    }

    return map[type]()
  }
}
