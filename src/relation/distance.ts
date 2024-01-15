import { GeolocusContext } from '@/context'
import {
  EuclideanDistanceRange,
  GeolocusObject,
  SemanticDistance,
} from '@/type'

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
    const index = this.SEMANTIC_MAP[term]
    const threshold = context.getSemanticDistanceMap()
    const range: EuclideanDistanceRange = threshold[index]
    return range
  }

  static distance(object0: GeolocusObject, object1: GeolocusObject) {
    const geom0 = object0.getGeometry()
    const geom1 = object1.getGeometry()
    const distance = geom0.distance(geom1)
    return distance
  }
}
