import { GeolocusContext } from '../context'
import { EuclideanDistanceRange, SemanticDistance } from '../type'
import { MathUtil, Vector2 } from '../util'

export class Distance {
  static SEMANTIC_MAP: {
    [props in SemanticDistance]: number
  } = {
    VN: 0,
    N: 1,
    M: 2,
    F: 3,
    VF: 4,
  }

  static transformSemanticDistance(
    term: SemanticDistance,
    context: GeolocusContext,
  ): EuclideanDistanceRange {
    const tag = this.SEMANTIC_MAP[term]
    const scale = context.getScale()
    const threshold = context.getSemanticDistanceThreshold()
    const range: EuclideanDistanceRange = [
      Math.floor(scale * threshold[tag]),
      Math.floor(scale * threshold[tag + 1]),
    ]
    return range
  }

  static distanceToBBox(
    x: number,
    y: number,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ) {
    const clampX = MathUtil.clamp(x, minX, maxX)
    const clampY = MathUtil.clamp(x, minY, maxY)
    return Vector2.distanceTo([clampX, clampY], [x, y])
  }
}
