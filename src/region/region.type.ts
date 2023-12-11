import { GeolocusMultiPolygonObject, GeolocusPolygonObject } from '../object'
import {
  GeolocusBBox,
  GeolocusGird,
  GeolocusObject,
  IGeoRelation,
  Position2,
} from '../type'

export interface IRegionHandler {
  (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
    region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
  ): {
    topologyRegion: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
    topologyPDF: IRegionPDF
  }
}

export interface IRelationHandler {
  (
    origin: GeolocusObject,
    target: GeolocusObject,
    region: GeolocusPolygonObject | GeolocusMultiPolygonObject,
  ): {
    topologyRegion: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
    topologyPDF: IRegionPDF
  }
}

export interface IRegionPDF {
  type: 0 | 1 | 2 | 3 | 4
  origin: GeolocusObject
  gdf: {
    distance: number | null
    distanceDelta: number | null
    azimuth: number | null
    azimuthDelta: number | null
  }
  sdf: {
    girdRegion: GeolocusMultiPolygonObject | GeolocusPolygonObject | null
    girdNum: number | null
  }
}

export interface IRegionResultPdfGird {
  type: 'gdf' | 'sdf' | null
  gird: GeolocusGird | null
  bbox: GeolocusBBox | null
}

export interface IRegionResult {
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
  pdf: IRegionPDF[]
  coord: Position2 | null
  pdfGird: IRegionResultPdfGird[]
  resultGird: GeolocusGird | null
  regionMask: GeolocusGird | null
}
