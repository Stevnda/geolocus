import { GeolocusContext } from '../context'
import { EuclideanDistanceRange, SemanticDistance } from '../type'

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
  ): EuclideanDistanceRange {
    const tag = this.SEMANTIC_MAP[term]
    const scale = GeolocusContext.SCALE
    const threshold = GeolocusContext.SEMANTIC_DISTANCE_THRESHOLD
    const range: EuclideanDistanceRange = [
      Math.floor(scale * threshold[tag]),
      Math.floor(scale * threshold[tag + 1]),
    ]
    return range
  }
}
