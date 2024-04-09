import { TGeolocusContext, TPosition2 } from '@/context'
import jsts from '@geolocus/jsts'
import {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'

export type TGeolocusGeometryName =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'

export type TGeolocusPointGeometry = jsts.geom.Point
export type TGeolocusLineStringGeometry = jsts.geom.LineString
export type TGeolocusPolygonGeometry = jsts.geom.Polygon
export type TGeolocusMultiPointGeometry = jsts.geom.MultiPoint
export type TGeolocusMultiLineStringGeometry = jsts.geom.MultiLineString
export type TGeolocusMultiPolygonGeometry = jsts.geom.MultiPolygon
export type TGeolocusGeometry = jsts.geom.Geometry

export type TGeolocusBBox = [number, number, number, number]

export interface IGeolocusObject {
  getContext(): TGeolocusContext | null
  getUUID(): string
  getType(): TGeolocusGeometryName
  getStatus(): TGeolocusObjectStatus
  getName(): string
  getGeometry(): TGeolocusGeometry
  getBBox(): TGeolocusBBox
  getCenter(): TPosition2
}

export interface IGeolocusObjectInit {
  context: TGeolocusContext | null
  uuid: string | null
  type: TGeolocusGeometryName | null
  status: TGeolocusObjectStatus | null
  name: string | null
  geometry: TGeolocusGeometry | null
  bbox: TGeolocusBBox | null
  center: TPosition2 | null
}

export type TGeolocusObject =
  | GeolocusPointObject
  | GeolocusLineStringObject
  | GeolocusPolygonObject
  | GeolocusMultiLineStringObject
  | GeolocusMultiPointObject
  | GeolocusMultiPolygonObject

export type TGeolocusObjectStatus = 'fuzzy' | 'precise' | 'computed'
