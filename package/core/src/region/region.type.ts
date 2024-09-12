import { GeolocusBBox, GeolocusObject, Position2 } from '@/object'
import { GeolocusGird } from '@/util'

export interface RegionPDFInput {
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
  pdf: RegionPDFInput
}

export interface RegionResultPdfGird {
  type: 'gdf' | 'sdf' | null
  gird: GeolocusGird | null
  bbox: GeolocusBBox | null
  weight: number
}

export interface RegionResult {
  region: GeolocusObject | null
  pdf: Set<RegionPDFInput>
  coord: Position2 | null
  pdfGird: RegionResultPdfGird[]
  resultGird: GeolocusGird | null
  regionMask: GeolocusGird | null
}
