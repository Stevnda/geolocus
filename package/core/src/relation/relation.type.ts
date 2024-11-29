import { Role } from '@/context'
import { GeoLayout } from './layout.type'

export type RelationMode = 'point' | 'line' | 'polygon'

export type EuclideanDistance = number
export type EuclideanDistanceRange = [number, number]
export type SemanticDistance = 'VN' | 'N' | 'M' | 'F' | 'VF'
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

export interface GeoRelation {
  topology: TopologyRelation
  direction?: number
  distance: EuclideanDistance | EuclideanDistanceRange
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
