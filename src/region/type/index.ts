import { Position2 } from '@/context'
import {
  GeolocusBBox,
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPolygonObject,
} from '@/object'
import { IGeoRelation } from '@/relation'
import { GeolocusGird } from '@/util'

export type IRegionRegion = GeolocusPolygonObject | GeolocusMultiPolygonObject

export interface IRegionHandlerResult {
  region: GeolocusMultiPolygonObject | GeolocusPolygonObject
  pdf: IRegionPDF
  boundless: boolean
}

export interface IRegionPDF {
  type: 'constant' | 'distance' | 'angle' | 'distanceAndAngle' | 'sdf'
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
  pdf: Map<string, IRegionPDF>
  coord: Position2 | null
  pdfGird: IRegionResultPdfGird[]
  resultGird: GeolocusGird | null
  regionMask: GeolocusGird | null
}

export interface IGeoTriple {
  origin: string
  relation: IGeoRelation
  target: string
}

export type RegionStrategy = {
  region: 'intersection' | 'union'
  gird: 'add' | 'multiply'
}
