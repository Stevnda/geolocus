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

export interface ArrangementLayoutInit {
  type: 'uniform' | 'random' | 'between'
}

export interface GeometryLayoutInit {
  type: 'line' | 'circle' | 'triangle' | 'rectangle' | 'hexagon'
  init:
    | LinearLayoutInit
    | CircularLayoutInit
    | TriangularLayoutInit
    | RectangularLayoutInit
    | HexagonalLayoutInit
}

export interface LinearLayoutInit {
  type: 'straight'
  gap: number
}

export interface CircularLayoutInit {
  type: 'solid' | 'hollow'
  gap: number
}

export interface TriangularLayoutInit {
  type: 'solid' | 'hollow' | 'vFormation'
  gap: number
  angle: number // radius
}

export interface RectangularLayoutInit {
  type: 'solid' | 'hollow'
  gap: number
  ratio: [number, number] // [width, height]
}

export interface HexagonalLayoutInit {
  type: 'solid' | 'hollow'
  gap: number
}

export type CustomLayout = Record<string, unknown>

export type GeoLayout = {
  layout: 'arrangement' | 'geometry' | 'sequence' | 'custom'
  number: number
  init: ArrangementLayoutInit | GeometryLayoutInit | CustomLayout
}

export interface GeoRelation {
  topology: TopologyRelation
  direction?: [number, number] // azimuth, range = max - min
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
