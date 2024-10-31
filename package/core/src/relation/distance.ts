import jsts from '@geolocus/jsts'
import {
  EuclideanDistance,
  EuclideanDistanceRange,
  SemanticDistance,
  SemanticDistanceMap,
} from './relation.type'
import { GeolocusGeometry, Position2 } from '@/object'

interface DistanceNormalization {
  max: number
  min: number
  mean: number
  range: number
}

export class Distance {
  static transformDistance(
    distance: EuclideanDistance | EuclideanDistanceRange | SemanticDistance,
    map: SemanticDistanceMap,
  ): EuclideanDistance | EuclideanDistanceRange {
    if (typeof distance === 'string') {
      const range: EuclideanDistanceRange = map[distance]
      return range
    }
    return distance
  }

  static normalize = (
    distance: EuclideanDistance | EuclideanDistanceRange,
  ): DistanceNormalization => {
    if (typeof distance === 'number') {
      const result: DistanceNormalization = {
        max: distance,
        min: distance,
        mean: distance,
        range: 0,
      }
      return result
    }
    const min = Math.min(...distance)
    const max = Math.max(...distance)
    const result: DistanceNormalization = {
      max,
      min,
      mean: (min + max) / 2,
      range: max - min,
    }
    return result
  }

  static distance(object0: GeolocusGeometry, object1: GeolocusGeometry) {
    const geom0 = object0.getGeometry()
    const geom1 = object1.getGeometry()
    const distance = jsts.operation.distance.DistanceOp.distance(geom0, geom1)
    return distance
  }

  static nearestPoints(
    object0: GeolocusGeometry,
    object1: GeolocusGeometry,
  ): [Position2, Position2] {
    const geom0 = object0.getGeometry()
    const geom1 = object1.getGeometry()
    const [coord0, coord1] = jsts.operation.distance.DistanceOp.nearestPoints(
      geom0,
      geom1,
    )
    return [
      [coord0.x, coord0.y],
      [coord1.x, coord1.y],
    ]
  }
}
