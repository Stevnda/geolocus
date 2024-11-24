import { GeolocusBBox, GeolocusObject, Position2 } from '@/object'
import { GeoTriple } from '@/relation'
import { GeolocusGird } from '@/util'

export interface PDFInput {
  type: 'distance' | 'angle' | 'distanceAndAngle' | 'sdf' | 'spread'
  origin: GeolocusObject // 高斯分布函数的起始点
  gdf: {
    // 高斯分布函数输入参数
    distance?: number
    distanceDelta?: number
    azimuth?: number
    azimuthDelta?: number
  }
  sdf: {
    girdRegion?: GeolocusObject // sdf 的计算区域, 与三元组的目标区域相同
    girdSum?: number // 计算栅格总数
  }
  spread: {
    girdRegion?: GeolocusObject // spread 的计算区域
    spreadPointList?: GeolocusObject // spread 的起始扩散点
    girdSum?: number // 计算栅格总数
  }
  weight: number
}

export interface RegionHandlerResult {
  region: GeolocusObject
  pdf: PDFInput
}

export interface PdfGird {
  type: 'gdf' | 'sdf' | 'spread' | null
  gird: GeolocusGird | null
  bbox: GeolocusBBox | null
  weight: number
}

export interface GeoTripleResult {
  coord: Position2 | Position2[] | null // 概率密度最大的若干个点, 只有描述多个点时为数组
  region: GeolocusObject | null // 三元组的目标区域
  pdfInput: PDFInput | null // 概率计算公式输入参数
  pdfGird: PdfGird | null // 三元组的目标区域的概率密度栅格
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
