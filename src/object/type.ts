import { Feature } from 'geojson'
import { GeolocusBBox, Position2 } from '../type'
import {
  GeolocusLineStringObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'

export interface IGeolocusObject {
  getUUID(): string
  getType(): 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon'
  getVertex(): Position2 | Position2[] | Position2[][] | Position2[][][]
  getBBox(): GeolocusBBox
  getCenter(): Position2
  getGeoJSON(): Feature
  clone(): GeolocusObject
}

export type GeolocusObject =
  | GeolocusPointObject
  | GeolocusLineStringObject
  | GeolocusPolygonObject
  | GeolocusMultiPolygonObject
