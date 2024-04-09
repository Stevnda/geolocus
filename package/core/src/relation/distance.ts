import { TGeolocusContext } from '@/context'
import {
  GeolocusMultiPolygonObject,
  GeolocusPolygonObject,
  TGeolocusObject,
  createEmptyGeolocusObject,
} from '@/object'
import jsts from '@geolocus/jsts'
import {
  IDistanceNormalization,
  TEuclideanDistance,
  TEuclideanDistanceRange,
  TIsInsideTag,
  TSemanticDistance,
} from './relation.type'
import { Topology } from './topology'

export class Distance {
  static SEMANTIC_MAP: {
    [props in TSemanticDistance]: number
  } = {
    VN: 0,
    N: 1,
    M: 2,
    F: 3,
    VF: 4,
  }

  static transformSemanticDistance(
    distance: TEuclideanDistance | TEuclideanDistanceRange | TSemanticDistance,
    context: TGeolocusContext,
  ): TEuclideanDistance | TEuclideanDistanceRange {
    const map = {
      number: (distance: number) => distance,
      object: (distance: [number, number]) => distance,
      string: (distance: TSemanticDistance, context: TGeolocusContext) => {
        const index = this.SEMANTIC_MAP[distance]
        const threshold = context.getSemanticDistanceMap()
        const range: TEuclideanDistanceRange = threshold[index]
        return range
      },
    }
    const type = typeof distance as 'number' | 'object' | 'string'
    const result = map[type](distance as never, context)
    return result
  }

  static normalize = (
    distance: TEuclideanDistance | TEuclideanDistanceRange,
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

  static distance(object0: TGeolocusObject, object1: TGeolocusObject) {
    const geom0 = object0.getGeometry()
    const geom1 = object1.getGeometry()
    const distance = jsts.operation.distance.DistanceOp.distance(geom0, geom1)
    return distance
  }

  static computeRegionAwayFromObject(
    object: TGeolocusObject,
    distance: TEuclideanDistance | TEuclideanDistanceRange,
    tag: TIsInsideTag,
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
    object: TGeolocusObject,
    distance: TEuclideanDistance,
    tag: TIsInsideTag,
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
    object: TGeolocusObject,
    distanceRange: TEuclideanDistanceRange,
    tag: TIsInsideTag,
  ) {
    const map = {
      inside: () =>
        Topology.bufferOfRange(
          object,
          distanceRange.map((value) => -value) as TEuclideanDistanceRange,
        ),
      outside: () => Topology.bufferOfRange(object, distanceRange),
      both: () => {
        let object0 = Topology.bufferOfRange(
          object,
          distanceRange.map((value) => -value) as TEuclideanDistanceRange,
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
