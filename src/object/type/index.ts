import { GeolocusContext } from '@/context'
import { GeolocusBBox, GeolocusObjectStatus, Position2 } from '@/type'
import * as jsts from 'jsts'

export type GeolocusGeometryType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'

export type GeolocusPointGeometry = jsts.geom.Point
export type GeolocusLineStringGeometry = jsts.geom.LineString
export type GeolocusPolygonGeometry = jsts.geom.Polygon
export type GeolocusMultiPointGeometry = jsts.geom.MultiPoint
export type GeolocusMultiLineStringGeometry = jsts.geom.MultiLineString
export type GeolocusMultiPolygonGeometry = jsts.geom.MultiPolygon
export type GeolocusGeometry = jsts.geom.Geometry

export interface IGeolocusObject {
  getContext(): GeolocusContext | null
  getUUID(): string
  getType(): GeolocusGeometryType
  getStatus(): GeolocusObjectStatus
  getName(): string
  getGeometry(): GeolocusGeometry
  getBBox(): GeolocusBBox
  getCenter(): Position2
}

export interface IGeolocusObjectInit {
  context?: GeolocusContext | null
  uuid?: string
  type?: GeolocusGeometryType
  status?: GeolocusObjectStatus
  name?: string
  geometry?: GeolocusGeometry
  bbox?: GeolocusBBox
  center?: Position2
}
