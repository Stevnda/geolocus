import { Role } from '@/context'

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

export type ComputeRegionRange = 'inside' | 'outside' | 'both'

export type TopologyRelation = 'equal' | 'intersect' | 'disjoint' | 'contain'

export interface GeoRelation {
  topology?: TopologyRelation
  direction?: AbsoluteDirection | RelativeDirection
  distance?: EuclideanDistance | EuclideanDistanceRange
  semantic?: string
  weight?: number
}

export interface GeoTriple {
  uuid: string
  role: Role
  origin: string
  relation: GeoRelation
  target: string
}

export type SemanticRelation = Omit<GeoRelation, 'weight'>
