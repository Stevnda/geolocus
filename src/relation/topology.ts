import * as turf from '@turf/turf'
import * as martinez from 'martinez-polygon-clipping'
import { Feature, Polygon } from 'geojson'
import { Position2 } from '../type'

export class Topology {
  static isEqual = (geoObject0: Feature, geoObject1: Feature) => {
    return turf.booleanEqual(geoObject0, geoObject1)
  }

  static isIntersect = (geoObject0: Feature, geoObject1: Feature) => {
    return turf.booleanIntersects(geoObject0, geoObject1)
  }

  static isDisjoint = (geoObject0: Feature, geoObject1: Feature) => {
    return turf.booleanDisjoint(geoObject0, geoObject1)
  }

  static isWithin = (geoObject0: Feature, geoObject1: Feature) => {
    return turf.booleanWithin(geoObject0, geoObject1)
  }

  static isContains = (geoObject0: Feature, geoObject1: Feature) => {
    return turf.booleanContains(geoObject0, geoObject1)
  }

  static isTouch = (geoObject0: Feature, geoObject1: Feature) => {
    return turf.booleanTouches(geoObject0, geoObject1)
  }

  static intersection = (
    polygon0: Feature<Polygon>,
    polygon1: Feature<Polygon>,
  ) => {
    const intersection = martinez.intersection(
      polygon0.geometry.coordinates,
      polygon1.geometry.coordinates,
    )

    if (!intersection || intersection.length === 0) {
      return null
    }

    return turf.multiPolygon(intersection as Position2[][][])
  }

  private static buffer = (object: Feature, distance: number) => {
    const converted = turf.toWgs84(object)
    return turf.toMercator(
      turf.buffer(converted, distance, {
        units: 'meters',
      }) as Feature<Polygon>,
    )
  }

  static bufferOfDistance = (geometry: Feature, distance: number) => {
    return this.buffer(geometry, distance)
  }

  static bufferOfRange = (geometry: Feature, range: [number, number]) => {
    const buffer0 = this.buffer(geometry, range[0])
    const buffer1 = this.buffer(geometry, range[1])

    return turf.mask(buffer1, buffer0)
  }
}
