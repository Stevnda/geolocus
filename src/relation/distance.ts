import { GeolocusContext } from '@/context'
import {
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPolygonObject,
  createEmptyGeolocusObject,
} from '@/object'
import { Topology } from './topology'
import {
  DirectionAndDistanceTag,
  EuclideanDistance,
  EuclideanDistanceRange,
  SemanticDistance,
} from './type'

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

  static computeRegionAwayFromObject(
    object: GeolocusObject,
    distance: EuclideanDistance | EuclideanDistanceRange,
    tag: DirectionAndDistanceTag,
  ): GeolocusPolygonObject | GeolocusMultiPolygonObject | null {
    if (typeof distance === 'number') {
      return this.computeRegionAwayFromObjectByDistance(object, distance, tag)
    } else {
      return this.computeRegionAwayFromObjectByDistanceRange(
        object,
        distance,
        tag,
      )
    }
  }

  private static computeRegionAwayFromObjectByDistance(
    object: GeolocusObject,
    distance: EuclideanDistance,
    tag: DirectionAndDistanceTag,
  ) {
    const map = {
      inside: () => Topology.bufferOfDistance(object, -distance),
      outside: () => Topology.bufferOfDistance(object, distance),
      both: () => {
        let object0 = Topology.bufferOfDistance(object, -distance)
        if (!object0) {
          object0 = createEmptyGeolocusObject('Polygon')
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const object1 = Topology.bufferOfDistance(object, distance)!
        const result = Topology.union(object0, object1) as
          | GeolocusPolygonObject
          | GeolocusMultiPolygonObject
        return result
      },
    }

    const result = map[tag]()
    return result
  }

  private static computeRegionAwayFromObjectByDistanceRange(
    object: GeolocusObject,
    distanceRange: EuclideanDistanceRange,
    tag: DirectionAndDistanceTag,
  ) {
    const map = {
      inside: () =>
        Topology.bufferOfRange(
          object,
          distanceRange.map((value) => -value) as EuclideanDistanceRange,
        ),
      outside: () => Topology.bufferOfRange(object, distanceRange),
      both: () => {
        let object0 = Topology.bufferOfRange(
          object,
          distanceRange.map((value) => -value) as EuclideanDistanceRange,
        )
        if (!object0) {
          object0 = createEmptyGeolocusObject('Polygon')
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const object1 = Topology.bufferOfRange(object, distanceRange)!
        const result = Topology.union(object0, object1) as
          | GeolocusPolygonObject
          | GeolocusMultiPolygonObject
        return result
      },
    }

    const result = map[tag]()
    return result
  }
}
