import { GeolocusMultiPolygonObject, GeolocusPolygonObject } from '../object'
import {
  GeolocusBBox,
  GeolocusGird,
  GeolocusObject,
  IGeoRelation,
  Position2,
} from '../type'

export type IRegionRegion = GeolocusPolygonObject | GeolocusMultiPolygonObject

export interface IRegionResultHandler {
  (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ): {
    region: GeolocusMultiPolygonObject | GeolocusPolygonObject
    pdf: IRegionPDF
    boundless: boolean
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
    girdRegion: IRegionRegion | null
    girdNum: number | null
  }
  weight: number
}

export interface IRegionResultPdfGird {
  type: 'gdf' | 'sdf' | null
  gird: GeolocusGird | null
  bbox: GeolocusBBox | null
  weight: number
}

export interface IRegionResult {
  region: IRegionRegion | null
  pdf: IRegionPDF[]
  coord: Position2 | null
  pdfGird: IRegionResultPdfGird[]
  resultGird: GeolocusGird | null
  regionMask: GeolocusGird | null
}
