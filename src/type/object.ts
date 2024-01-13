import {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '@/object'

export type GeolocusBBox = [number, number, number, number]

export type GeolocusObject =
  | GeolocusPointObject
  | GeolocusLineStringObject
  | GeolocusPolygonObject
  | GeolocusMultiLineStringObject
  | GeolocusMultiPointObject
  | GeolocusMultiPolygonObject

export type GeolocusObjectStatus = 'fuzzy' | 'precise' | 'computed'
