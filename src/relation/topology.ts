import {
  GeolocusGeometry,
  GeolocusGeometryMeta,
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '@/object'
import { GeolocusGeometryType } from '@/object/type'
import { EuclideanDistance, EuclideanDistanceRange } from './type'

export class Topology {
  // static isEqual = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.equalsExact(originGeometry, 0.00001)
  // }

  // static isIntersect = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.intersects(originGeometry)
  // }

  // static isDisjoint = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.disjoint(originGeometry)
  // }

  // static isWithin = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.within(originGeometry)
  // }

  // static isContains = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.contains(originGeometry)
  // }

  // static isTouch = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.touches(originGeometry)
  // }

  private static _objectFactoryMap = {
    Point: GeolocusPointObject,
    LineString: GeolocusLineStringObject,
    Polygon: GeolocusPolygonObject,
    MultiPoint: GeolocusMultiPointObject,
    MultiLineString: GeolocusMultiLineStringObject,
    MultiPolygon: GeolocusMultiPolygonObject,
  }

  static difference = (origin: GeolocusObject, target: GeolocusObject) => {
    const originGeometry = origin.getGeometry()
    const targetGeometry = target.getGeometry()
    const result = originGeometry.difference(targetGeometry)

    if (result.isEmpty()) {
      return null
    }
    const type = result.getGeometryType() as GeolocusGeometryType
    const bbox = GeolocusGeometryMeta.getBBox(result)
    const center = GeolocusGeometryMeta.getCenter(result)
    const Factory = this._objectFactoryMap[type]
    const object = new Factory(null as never, {
      type: type as never,
      bbox,
      center,
      context: origin.getContext(),
      geometry: result,
    })
    return object
  }

  static intersection = (
    polygon0: GeolocusObject,
    polygon1: GeolocusObject,
  ) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const intersection = geometry0.intersection(geometry1)

    if (intersection.isEmpty()) {
      return null
    }
    const type = intersection.getGeometryType() as GeolocusGeometryType
    const bbox = GeolocusGeometryMeta.getBBox(intersection)
    const center = GeolocusGeometryMeta.getCenter(intersection)
    const Factory = this._objectFactoryMap[type]
    const object = new Factory(null as never, {
      type: type as never,
      bbox,
      center,
      context: polygon0.getContext(),
      geometry: intersection,
    })
    return object
  }

  static union = (polygon0: GeolocusObject, polygon1: GeolocusObject) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const union = geometry0.union(geometry1)

    const type = union.getGeometryType() as GeolocusGeometryType
    const bbox = GeolocusGeometryMeta.getBBox(union)
    const center = GeolocusGeometryMeta.getCenter(union)
    const Factory = this._objectFactoryMap[type]
    const object = new Factory(null as never, {
      type: type as never,
      bbox,
      center,
      context: polygon0.getContext(),
      geometry: union,
    })
    return object
  }

  private static buffer = (
    geometry: GeolocusGeometry,
    distance: EuclideanDistance,
  ) => {
    const buffer = geometry.buffer(distance)
    return buffer
  }

  static bufferOfDistance = (
    object: GeolocusObject,
    distance: EuclideanDistance,
  ) => {
    const geometry = object.getGeometry()
    const buffer = this.buffer(geometry, distance)

    if (buffer.isEmpty()) {
      return null
    }
    const type = buffer.getGeometryType() as 'Polygon' | 'MultiPolygon'
    const bbox = GeolocusGeometryMeta.getBBox(buffer)
    const center = GeolocusGeometryMeta.getCenter(buffer)
    const Factory = this._objectFactoryMap[type]
    const polygon = new Factory([] as never, {
      type: type as never,
      bbox,
      center,
      context: object.getContext(),
      geometry: buffer,
    })
    return polygon
  }

  static bufferOfRange = (
    object: GeolocusObject,
    range: EuclideanDistanceRange,
  ) => {
    const min = Math.min(...range)
    const max = Math.max(...range)

    const geometry = object.getGeometry()
    const buffer0 = this.buffer(geometry, min)
    const buffer1 = this.buffer(geometry, max)
    const difference = buffer1.difference(buffer0)

    if (difference.isEmpty()) {
      return null
    }
    const type = difference.getGeometryType() as 'Polygon' | 'MultiPolygon'
    const bbox = GeolocusGeometryMeta.getBBox(difference)
    const center = GeolocusGeometryMeta.getCenter(difference)
    const Factory = this._objectFactoryMap[type]
    const polygon = new Factory([] as never, {
      type: type as never,
      bbox,
      center,
      context: object.getContext(),
      geometry: difference,
    })
    return polygon
  }
}
