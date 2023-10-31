import * as turf from '@turf/turf'
import { Feature, Polygon } from 'geojson'
import { GeolocusObject, GeolocusPolygonObject } from '../object'

export class Topology {
  static isEqual = (geoObject0: GeolocusObject, geoObject1: GeolocusObject) => {
    return turf.booleanEqual(geoObject0.getGeoJSON(), geoObject1.getGeoJSON())
  }

  static isIntersect = (
    geoObject0: GeolocusObject,
    geoObject1: GeolocusObject,
  ) => {
    return turf.booleanIntersects(
      geoObject0.getGeoJSON(),
      geoObject1.getGeoJSON(),
    )
  }

  static isDisjoint = (
    geoObject0: GeolocusObject,
    geoObject1: GeolocusObject,
  ) => {
    return turf.booleanDisjoint(
      geoObject0.getGeoJSON(),
      geoObject1.getGeoJSON(),
    )
  }

  static isWithin = (
    geoObject0: GeolocusObject,
    geoObject1: GeolocusObject,
  ) => {
    return turf.booleanWithin(geoObject0.getGeoJSON(), geoObject1.getGeoJSON())
  }

  static isContains = (
    geoObject0: GeolocusObject,
    geoObject1: GeolocusObject,
  ) => {
    return turf.booleanContains(
      geoObject0.getGeoJSON(),
      geoObject1.getGeoJSON(),
    )
  }

  static isTouch = (geoObject0: GeolocusObject, geoObject1: GeolocusObject) => {
    return turf.booleanTouches(geoObject0.getGeoJSON(), geoObject1.getGeoJSON())
  }

  static intersection = (
    polygon0: GeolocusPolygonObject,
    polygon1: GeolocusPolygonObject,
  ) => {
    const intersection = turf.intersect(
      turf.featureCollection([polygon0.getGeoJSON(), polygon1.getGeoJSON()]),
    )

    if (!intersection) {
      return null
    }

    return intersection
  }

  private static buffer = (object: GeolocusObject, distance: number) => {
    const converted = turf.toWgs84(object.getGeoJSON())
    return turf.toMercator(
      turf.buffer(converted, distance, {
        units: 'meters',
      }) as Feature<Polygon>,
    )
  }

  static bufferOfDistance = (geometry: GeolocusObject, distance: number) => {
    return this.buffer(geometry, distance).geometry
  }

  static bufferOfRange = (
    geometry: GeolocusObject,
    range: [number, number],
  ) => {
    const buffer0 = this.buffer(geometry, range[0])
    const buffer1 = this.buffer(geometry, range[1])

    return turf.mask(buffer1, buffer0).geometry
  }
}
