import {
  GeolocusGeometryMeta,
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
  TGeolocusGeometry,
  TGeolocusObject,
} from '@/object'
import { TGeolocusGeometryName } from '@/object/object.type'
import jsts from '@geolocus/jsts'
import { TEuclideanDistance, TEuclideanDistanceRange } from './relation.type'

export class Topology {
  private static _objectFactoryMap = {
    Point: GeolocusPointObject,
    LineString: GeolocusLineStringObject,
    Polygon: GeolocusPolygonObject,
    MultiPoint: GeolocusMultiPointObject,
    MultiLineString: GeolocusMultiLineStringObject,
    MultiPolygon: GeolocusMultiPolygonObject,
  }

  static difference = (origin: TGeolocusObject, target: TGeolocusObject) => {
    const originGeometry = origin.getGeometry()
    const targetGeometry = target.getGeometry()
    const result = jsts.operation.overlay.OverlayOp.difference(
      originGeometry,
      targetGeometry,
    )

    if (result.isEmpty()) {
      return null
    }
    const type = result.getGeometryType() as TGeolocusGeometryName
    const bbox = GeolocusGeometryMeta.getBBox(result)
    const center = GeolocusGeometryMeta.getCenter(result)
    const Factory = this._objectFactoryMap[type]
    const object = new Factory(null as never, {
      type: type as never,
      bbox,
      center,
      context: origin.getContext(),
      geometry: result,
      name: null,
      status: null,
      uuid: null,
    })
    return object
  }

  static intersection = (
    polygon0: TGeolocusObject,
    polygon1: TGeolocusObject,
  ) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const intersection = jsts.operation.overlay.OverlayOp.intersection(
      geometry0,
      geometry1,
    )

    if (intersection.isEmpty()) {
      return null
    }
    const type = intersection.getGeometryType() as TGeolocusGeometryName
    const bbox = GeolocusGeometryMeta.getBBox(intersection)
    const center = GeolocusGeometryMeta.getCenter(intersection)
    const Factory = this._objectFactoryMap[type]
    const object = new Factory(null as never, {
      type: type as never,
      bbox,
      center,
      context: polygon0.getContext(),
      geometry: intersection,
      name: null,
      status: null,
      uuid: null,
    })
    return object
  }

  static union = (polygon0: TGeolocusObject, polygon1: TGeolocusObject) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const union = jsts.operation.overlay.OverlayOp.union(geometry0, geometry1)

    const type = union.getGeometryType() as TGeolocusGeometryName
    const bbox = GeolocusGeometryMeta.getBBox(union)
    const center = GeolocusGeometryMeta.getCenter(union)
    const Factory = this._objectFactoryMap[type]
    const object = new Factory(null as never, {
      type: type as never,
      bbox,
      center,
      context: polygon0.getContext(),
      geometry: union,
      name: null,
      status: null,
      uuid: null,
    })
    return object
  }

  private static buffer = (
    geometry: TGeolocusGeometry,
    distance: TEuclideanDistance,
  ) => {
    const buffer = jsts.operation.buffer.BufferOp.bufferOp(geometry, distance)
    return buffer
  }

  static bufferOfDistance = (
    object: TGeolocusObject,
    distance: TEuclideanDistance,
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
      name: null,
      status: null,
      uuid: null,
    })
    return polygon
  }

  static bufferOfRange = (
    object: TGeolocusObject,
    range: TEuclideanDistanceRange,
  ) => {
    const min = Math.min(...range)
    const max = Math.max(...range)

    const geometry = object.getGeometry()
    const buffer0 = this.buffer(geometry, min)
    const buffer1 = this.buffer(geometry, max)
    const difference = jsts.operation.overlay.OverlayOp.difference(
      buffer1,
      buffer0,
    )

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
      name: null,
      status: null,
      uuid: null,
    })
    return polygon
  }
}
