import { GeolocusContext } from '@/context'
import {
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPolygonObject,
  createEmptyGeolocusObject,
} from '@/object'
import jsts from '@geolocus/jsts'
import { Topology } from './topology'
import {
  DirectionAndDistanceTag,
  EuclideanDistance,
  EuclideanDistanceRange,
  IDistanceNormalization,
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
    distance: EuclideanDistance | EuclideanDistanceRange | SemanticDistance,
    context: GeolocusContext,
  ): EuclideanDistance | EuclideanDistanceRange {
    const map = {
      number: (distance: number) => distance,
      object: (distance: [number, number]) => distance,
      string: (distance: SemanticDistance, context: GeolocusContext) => {
        const index = this.SEMANTIC_MAP[distance]
        const threshold = context.getSemanticDistanceMap()
        const range: EuclideanDistanceRange = threshold[index]
        return range
      },
    }
    const type = typeof distance as 'number' | 'object' | 'string'
    const result = map[type](distance as never, context)
    return result
  }

  static normalize = (
    distance: EuclideanDistance | EuclideanDistanceRange,
  ): IDistanceNormalization => {
    const map = {
      number: (distance: number) => {
        const result: IDistanceNormalization = {
          max: distance,
          min: distance,
          mean: distance,
          range: 0,
        }
        return result
      },
      object: (distance: [number, number]) => {
        const min = Math.min(...distance)
        const max = Math.max(...distance)
        const result: IDistanceNormalization = {
          max,
          min,
          mean: (min + max) / 2,
          range: max - min,
        }
        return result
      },
    }
    const type = typeof distance as 'number' | 'object'
    const result = map[type](distance as never)
    return result
  }

  static distance(object0: GeolocusObject, object1: GeolocusObject) {
    const geom0 = object0.getGeometry()
    const geom1 = object1.getGeometry()
    const distance = jsts.operation.distance.DistanceOp.distance(geom0, geom1)
    return distance
  }

  static computeRegionAwayFromObject(
    object: GeolocusObject,
    distance: EuclideanDistance | EuclideanDistanceRange,
    tag: DirectionAndDistanceTag,
  ): GeolocusPolygonObject | GeolocusMultiPolygonObject | null {
    const type = typeof distance as 'number' | 'object'
    const map = {
      number: this.computeRegionAwayFromObjectByDistance,
      object: this.computeRegionAwayFromObjectByDistanceRange,
    }
    const result = map[type](object, distance as never, tag)
    return result
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
