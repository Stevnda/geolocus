import { GeolocusMultiPolygonObject, GeolocusPolygonObject } from '../object'
import { GeolocusGird, GeolocusObject, IGeoRelation, Position2 } from '../type'

export interface IRegionHandler {
  (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
    result: IRegionResult,
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
  }
}

export interface IRegionPDF {
  type: 0 | 1 | 2 | 3 | 4
  origin: Position2
  gdf: {
    distance: number | null
    distanceDelta: number | null
    azimuth: number | null
    azimuthDelta: number | null
  }
  sdf: {
    geolocusObject: GeolocusMultiPolygonObject | GeolocusPolygonObject | null
    girdNum: number | null
  }
}

export interface IRegionResult {
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
  pdf: IRegionPDF[]
  coord: Position2 | null
  pdfGird: GeolocusGird[]
  resultGird: GeolocusGird | null
  regionMask: GeolocusGird | null
}
