import {
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPolygonObject,
} from '../object'
import { IGeoRelation, Position2 } from '../type'

export interface IRegionHandler {
  (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
    result: IRegionResult,
    index: number,
  ): void
}

export interface IRelationHandler {
  (
    origin: GeolocusObject,
    target: GeolocusObject,
    result: IRegionResult,
  ): {
    topologyRegion: IRegionResult['region']
    topologyPDF: IRegionPDF
    fuzzyRegion: GeolocusPolygonObject
  }
}

export interface IRegionPDF {
  type: 0 | 1 | 2 | 3
  origin: Position2
  distance: number | null
  distanceDelta: number | null
  azimuth: number | null
  azimuthDelta: number | null
}

export interface IRegionResult {
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
  PDF: IRegionPDF[]
}
