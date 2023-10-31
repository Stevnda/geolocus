import * as turf from '@turf/turf'
import { Feature, Polygon } from 'geojson'
import { GeoJSONPolygon, GeolocusGeoJSON } from '../object'

export class Topology {
  static isEqual = (
    geoObject0: GeolocusGeoJSON,
    geoObject1: GeolocusGeoJSON,
  ) => {
    return turf.booleanEqual(geoObject0, geoObject1)
  }

  static isIntersect = (
    geoObject0: GeolocusGeoJSON,
    geoObject1: GeolocusGeoJSON,
  ) => {
    return turf.booleanIntersects(geoObject0, geoObject1)
  }

  static isDisjoint = (
    geoObject0: GeolocusGeoJSON,
    geoObject1: GeolocusGeoJSON,
  ) => {
    return turf.booleanDisjoint(geoObject0, geoObject1)
  }

  static isWithin = (
    geoObject0: GeolocusGeoJSON,
    geoObject1: GeolocusGeoJSON,
  ) => {
    return turf.booleanWithin(geoObject0, geoObject1)
  }

  static isContains = (
    geoObject0: GeolocusGeoJSON,
    geoObject1: GeolocusGeoJSON,
  ) => {
    return turf.booleanContains(geoObject0, geoObject1)
  }

  static isTouch = (
    geoObject0: GeolocusGeoJSON,
    geoObject1: GeolocusGeoJSON,
  ) => {
    return turf.booleanTouches(geoObject0, geoObject1)
  }

  static intersection = (
    polygon0: GeoJSONPolygon,
    polygon1: GeoJSONPolygon,
  ) => {
    const intersection = turf.intersect(
      turf.featureCollection([polygon0, polygon1]),
    )

    if (!intersection) {
      return null
    }

    return intersection
  }

  private static buffer = (object: GeolocusGeoJSON, distance: number) => {
    const converted = turf.toWgs84(object)
    return turf.toMercator(
      turf.buffer(converted, distance, {
        units: 'meters',
      }) as Feature<Polygon>,
    )
  }

  static bufferOfDistance = (geometry: GeolocusGeoJSON, distance: number) => {
    return this.buffer(geometry, distance)
  }

  static bufferOfRange = (
    geometry: GeolocusGeoJSON,
    range: [number, number],
  ) => {
    const buffer0 = this.buffer(geometry, range[0])
    const buffer1 = this.buffer(geometry, range[1])

    return turf.mask(buffer1, buffer0)
  }
}
