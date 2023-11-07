import { Vector2 } from '../math'
import { Position2 } from '../type'

interface IGetRegionPDF {
  0: (tag: boolean) => 0 | 1
  1: (
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
  ) => number
  2: (origin: Position2, target: Position2, azimuth: number) => number
  3: (
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
    azimuth: number,
  ) => number
}

export class RegionPDF {
  private static calculateNormalDistributionValue(
    x: number,
    mean: number,
    std: number,
  ) {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2))
    const coefficient = 1 / (std * Math.sqrt(2 * Math.PI))
    const result = coefficient * Math.exp(exponent)

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
    const result = coefficient * Math.exp(exponent)

    return result
  }

  static constant(tag: boolean): 0 | 1 {
    return Number(tag) as 0 | 1
  }

  static distance(
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
  ) {
    const x = Vector2.distanceTo(origin, target)

    return this.calculateNormalDistributionValue(x, distance, delta / 2)
  }

  static angle(
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

    return this.calculateNormalDistributionValue(radians, 0, delta / 3)
  }

  static distanceAndAngle(
    origin: Position2,
    target: Position2,
    distance: number,
    deltaDistance: number,
    azimuth: number,
    deltaDirection: number,
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
      deltaDirection / 3,
    )
  }

  static getPDF<T extends keyof IGetRegionPDF>(number: T) {
    return {
      0: this.constant,
      1: this.distance,
      2: this.angle,
      3: this.distanceAndAngle,
    }[number]
  }
}
