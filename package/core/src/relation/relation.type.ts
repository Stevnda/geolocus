import { Role } from '@/context'
import {
  UserGeolocusTripleOrigin,
  UserGeolocusTriple,
  UserGeoRelation,
} from '..'

export type RelationMode = 'point' | 'line' | 'polygon'

export type EuclideanDistance = number
export type EuclideanDistanceRange = [number, number]
export type SemanticDistance = 'VN' | 'N' | 'M' | 'F' | 'VF'
export type TimeDistance = {
  time: number // 秒
  rate: string | number // 交通工具或者速度 (m/s)
}
export type SemanticDistanceMap = Record<
  SemanticDistance,
  EuclideanDistanceRange
>

export type AbsoluteDirection =
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW'
export type RelativeDirection =
  | 'F'
  | 'FR'
  | 'R'
  | 'BR'
  | 'B'
  | 'BL'
  | 'L'
  | 'FL'
export type SemanticDirection = AbsoluteDirection | RelativeDirection

export type ComputeRegionRange = 'inside' | 'outside' | 'both'

export type TopologyRelation =
  | 'disjoint'
  | 'contain'
  | 'within'
  | 'intersect'
  | 'along'
  | 'toward'

export interface ArrangementLayout {
  type: 'uniform' | 'random' | 'between'
  number: number
}

export interface LinearLayout {
  type: 'straight'
  number: number
  init: {
    length: number
  }
}

export interface CircularLayout {
  type: 'solid' | 'hollow' | 'annulus'
  number: number
  init: {
    radius0: number
    radius1: number
  }
}

export interface TriangularLayout {
  type: 'solid' | 'hollow' | 'vFormation'
  number: number
  init: {
    angle: number
    sideLength: number
  }
}

export interface RectangularLayout {
  type: 'solid' | 'hollow'
  number: number
  init: {
    width: number
    height: number
  }
}

export interface HexagonalLayout {
  type: 'solid' | 'hollow'
  number: number
  init: {
    sideLength: number
  }
}

export interface CustomLayout {
  type: string
  number: number
  init: object
}

export type GeoLayout =
  | ArrangementLayout
  | LinearLayout
  | CircularLayout
  | TriangularLayout
  | RectangularLayout
  | HexagonalLayout
  // | RegularPolygonLayout
  | CustomLayout

export interface GeoRelation {
  topology: TopologyRelation
  direction?: number
  distance: EuclideanDistance | EuclideanDistanceRange
  towardUUIDList?: string[] // 这个是 toward 运行时临时生成的
  range: ComputeRegionRange
  layout?: GeoLayout
  weight: number
}

export interface GeoTriple {
  uuid: string
  role: Role
  originUUIDList: string[] | null
  relation: GeoRelation
  targetUUID: string
}

export type SemanticRelation = Omit<GeoRelation, 'weight'>

export interface RelationTriple {
  role: string
  originList?: (UserGeolocusTripleOrigin | UserGeolocusTriple)[]
  relation?: UserGeoRelation
  target: string
}
