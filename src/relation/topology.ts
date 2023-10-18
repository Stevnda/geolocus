import booleanTouches from '@turf/boolean-touches'
import * as turf from '@turf/turf'
import { GeolocusGeometry } from '../object'
import { GeolocusPolygonGeometry } from '../object/geometry'

export class Topology {
  static isEqual = (
    geometry0: GeolocusGeometry,
    geometry1: GeolocusGeometry,
  ) => {
    return turf.booleanEqual(geometry0, geometry1)
  }

  static isIntersect = (
    geometry0: GeolocusGeometry,
    geometry1: GeolocusGeometry,
  ) => {
    return turf.booleanIntersects(geometry0, geometry1)
  }

  static isDisjoint = (
    geometry0: GeolocusGeometry,
    geometry1: GeolocusGeometry,
  ) => {
    return turf.booleanDisjoint(geometry0, geometry1)
  }

  static isWithin = (
    geometry0: GeolocusGeometry,
    geometry1: GeolocusGeometry,
  ) => {
    return turf.booleanWithin(geometry0, geometry1)
  }

  static isContains = (
    geometry0: GeolocusGeometry,
    geometry1: GeolocusGeometry,
  ) => {
    return turf.booleanContains(geometry0, geometry1)
  }

  static isTouch = (
    geometry0: GeolocusGeometry,
    geometry1: GeolocusGeometry,
  ) => {
    return booleanTouches(geometry0, geometry1)
  }

  static intersection = (
    polygon0: GeolocusPolygonGeometry,
    polygon1: GeolocusPolygonGeometry,
  ): null | GeolocusPolygonGeometry => {
    const intersection = turf.intersect(polygon0, polygon1)

    if (!intersection) {
      return null
    }

    return intersection.geometry as GeolocusPolygonGeometry
  }

  private static buffer = (geometry: GeolocusGeometry, distance: number) => {
    const converted = turf.toWgs84(geometry)
    return turf.toMercator(
      turf.buffer(converted, distance, {
        units: 'meters',
      }) as turf.Feature<turf.Polygon>,
    )
  }

  static bufferOfDistance = (geometry: GeolocusGeometry, distance: number) => {
    return this.buffer(geometry, distance).geometry
  }

  static bufferOfRange = (
    geometry: GeolocusGeometry,
    range: [number, number],
  ) => {
    const buffer0 = this.buffer(geometry, range[0])
    const buffer1 = this.buffer(geometry, range[1])

    return turf.mask(buffer1, buffer0).geometry
  }
}
