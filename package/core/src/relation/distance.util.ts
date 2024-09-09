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

  // static computeRegion(
  //   geometry: GeolocusGeometry,
  //   distance: EuclideanDistance | EuclideanDistanceRange,
  //   range: ComputeRegionRange,
  // ): GeolocusGeometry | null {
  //   if (typeof distance === 'number') {
  //     return this.computeRegionByDistance(geometry, distance, range)
  //   }
  //   return this.computeRegionByDistanceRange(geometry, distance, range)
  // }

  // private static computeRegionByDistance(
  //   geometry: GeolocusGeometry,
  //   distance: EuclideanDistance,
  //   range: ComputeRegionRange,
  // ) {
  //   const map = {
  //     inside: () => Topology.bufferOfDistance(geometry, -distance),
  //     outside: () => Topology.bufferOfDistance(geometry, distance),
  //     both: () => {
  //       const geom0 = Topology.bufferOfDistance(geometry, -distance)
  //       const geom1 = Topology.bufferOfDistance(
  //         geometry,
  //         distance,
  //       ) as GeolocusGeometry
  //       if (geom0) {
  //         return Topology.union(geom0, geom1)
  //       }
  //       return geom1
  //     },
  //   }

  //   const result = map[range]()
  //   return result
  // }

  // private static computeRegionByDistanceRange(
  //   geometry: GeolocusGeometry,
  //   distanceRange: EuclideanDistanceRange,
  //   range: ComputeRegionRange,
  // ) {
  //   const map = {
  //     inside: () =>
  //       Topology.bufferOfRange(
  //         geometry,
  //         distanceRange.map((value) => -value) as EuclideanDistanceRange,
  //       ),
  //     outside: () => Topology.bufferOfRange(geometry, distanceRange),
  //     both: () => {
  //       const geom0 = Topology.bufferOfRange(
  //         geometry,
  //         distanceRange.map((value) => -value) as EuclideanDistanceRange,
  //       )
  //       const geom1 = Topology.bufferOfRange(
  //         geometry,
  //         distanceRange,
  //       ) as GeolocusGeometry
  //       if (geom0) {
  //         const result = Topology.union(geom0, geom1)
  //         return result
  //       }
  //       return Topology.union(geometry, geom1) as GeolocusGeometry
  //     },
  //   }

  //   const result = map[range]()
  //   return result
  // }
}
