import * as turf from '@turf/turf'
import { Feature, LineString, MultiPolygon, Point, Polygon } from 'geojson'
import * as martinez from 'martinez-polygon-clipping'
import { GeolocusPolygonObject } from '../object'
import {
  GeolocusLineStringObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
} from '../object/object'
import {
  EuclideanDistance,
  EuclideanDistanceRange,
  GeolocusObject,
  Position2,
} from '../type'

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

  static mask = (
    object: GeolocusPolygonObject,
    mask: GeolocusPolygonObject,
  ) => {
    return GeolocusPolygonObject.fromGeoJSON(
      turf.mask(object.getGeoJSON(), mask.getGeoJSON()),
    )
  }

  static intersection = (
    polygon0: GeolocusPolygonObject | GeolocusMultiPolygonObject,
    polygon1: GeolocusPolygonObject | GeolocusMultiPolygonObject,
  ) => {
    const intersection = martinez.intersection(
      polygon0.getGeoJSON().geometry.coordinates,
      polygon1.getGeoJSON().geometry.coordinates,
    )

    if (!intersection || intersection.length === 0) {
      return null
    }

    return new GeolocusMultiPolygonObject(intersection as Position2[][][])
  }

  private static buffer = (
    object: GeolocusObject,
    distance: EuclideanDistance,
  ) => {
    const converted = turf.toWgs84(object.getGeoJSON())
    return turf.toMercator(
      turf.buffer(converted, distance, {
        units: 'meters',
      }) as Feature<Polygon>,
    )
  }

  static bufferOfDistance = (
    object: GeolocusObject,
    distance: EuclideanDistance,
  ) => {
    return new GeolocusPolygonObject(
      this.buffer(object, distance).geometry.coordinates as Position2[][],
    )
  }

  static bufferOfRange = (
    object: GeolocusObject,
    range: EuclideanDistanceRange,
  ) => {
    const min = Math.min(...range)
    const max = Math.max(...range)
    const buffer0 = this.buffer(object, min)
    const buffer1 = this.buffer(object, max)
    const difference = martinez.diff(
      buffer1.geometry.coordinates,
      buffer0.geometry.coordinates,
    )

    return new GeolocusMultiPolygonObject(difference as Position2[][][])
  }

  static transformTranslate(
    object: GeolocusObject,
    distance: EuclideanDistance,
    direction: number,
  ): GeolocusObject {
    const type = object.getType()
    const converted = turf.toWgs84(object.getGeoJSON())
    const feature = turf.toMercator(
      turf.transformTranslate(converted, distance, direction, {
        units: 'meters',
      }),
    )

    if (type === 'Point') {
      return GeolocusPointObject.fromGeoJSON(feature as Feature<Point>)
    } else if (type === 'LineString') {
      return GeolocusLineStringObject.fromGeoJSON(
        feature as Feature<LineString>,
      )
    } else if (type === 'Polygon') {
      return GeolocusPolygonObject.fromGeoJSON(feature as Feature<Polygon>)
    } else {
      return GeolocusMultiPolygonObject.fromGeoJSON(
        feature as Feature<MultiPolygon>,
      )
    }
  }
}
