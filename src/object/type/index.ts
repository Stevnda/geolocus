import { GeolocusContext, Position2 } from '@/context'
import * as jsts from 'jsts'
import {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'

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

export type GeolocusBBox = [number, number, number, number]

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

export type GeolocusObject =
  | GeolocusPointObject
  | GeolocusLineStringObject
  | GeolocusPolygonObject
  | GeolocusMultiLineStringObject
  | GeolocusMultiPointObject
  | GeolocusMultiPolygonObject

export type GeolocusObjectStatus = 'fuzzy' | 'precise' | 'computed'
