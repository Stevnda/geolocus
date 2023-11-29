import {
  GeolocusLineStringObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'

export type GeolocusBBox = [number, number, number, number]

export type GeolocusGeometry =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPolygon'

export type GeolocusObject =
  | GeolocusPointObject
  | GeolocusLineStringObject
  | GeolocusPolygonObject
  | GeolocusMultiPolygonObject
