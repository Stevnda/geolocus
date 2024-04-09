import { TPosition2 } from '@/context'
import {
  GeolocusMultiPolygonObject,
  GeolocusPolygonObject,
  TGeolocusBBox,
  TGeolocusObject,
} from '@/object'
import { IGeoRelation } from '@/relation'
import { TGeolocusGird } from '@/util'

export type TRegionRegion = GeolocusPolygonObject | GeolocusMultiPolygonObject

export interface IRegionHandlerResult {
  region: GeolocusMultiPolygonObject | GeolocusPolygonObject
  pdf: IRegionPDF
  boundless: boolean
}

export interface IRegionPDF {
  type: 'constant' | 'distance' | 'angle' | 'distanceAndAngle' | 'sdf'
  origin: TGeolocusObject
  gdf: {
    distance: number | null
    distanceDelta: number | null
    azimuth: number | null
    azimuthDelta: number | null
  }
  sdf: {
    girdRegion: TRegionRegion | null
    girdNum: number | null
  }
  weight: number
}

export interface IRegionResultPdfGird {
  type: 'gdf' | 'sdf' | null
  gird: TGeolocusGird | null
  bbox: TGeolocusBBox | null
  weight: number
}

// the uuid of IRegionPDF is the same as its corresponding triple
export interface IRegionResult {
  region: TRegionRegion | null
  pdf: Map<string, IRegionPDF>
  coord: TPosition2 | null
  pdfGird: IRegionResultPdfGird[]
  resultGird: TGeolocusGird | null
  regionMask: TGeolocusGird | null
}

export interface IGeoTriple {
  origin: string
  relation: IGeoRelation
  target: string
}

export type TRegionStrategy = {
  region: 'intersection' | 'union'
  gird: 'add' | 'multiply'
}
