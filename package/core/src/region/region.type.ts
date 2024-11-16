import { GeolocusBBox, GeolocusObject, Position2 } from '@/object'
import { GeoTriple } from '@/relation'
import { GeolocusGird } from '@/util'

export interface PDFInput {
  type: 'distance' | 'angle' | 'distanceAndAngle' | 'sdf'
  origin: GeolocusObject
  gdf: {
    distance?: number
    distanceDelta?: number
    azimuth?: number
    azimuthDelta?: number
  }
  sdf: {
    girdRegion?: GeolocusObject
    girdNum?: number
  }
  weight: number
}

export interface RegionHandlerResult {
  region: GeolocusObject
  pdf: PDFInput
}

export interface PdfGird {
  type: 'gdf' | 'sdf' | null
  gird: GeolocusGird | null
  bbox: GeolocusBBox | null
  weight: number
}

export interface GeoTripleResult {
  coord: Position2 | null
  region: GeolocusObject | null
  pdfInput: PDFInput | null
  pdfGird: PdfGird | null
}

export interface PointResult {
  geoTripleList: GeoTriple[]
  geoTripleResultList: GeoTripleResult[]
  region: GeolocusObject | null
  regionPdfGird: GeolocusGird | null
  result: GeolocusObject | null
}

export interface LineResult {
  geoTripleList: GeoTriple[]
  geoTripleResultList: GeoTripleResult[]
  region: GeolocusObject | null
  regionPdfGird: GeolocusGird | null
  result: GeolocusObject | null
}

export type RegionResult = PointResult | LineResult
