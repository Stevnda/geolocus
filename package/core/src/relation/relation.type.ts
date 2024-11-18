import { Role } from '@/context'

export type RelationMode = 'point' | 'line' | 'plygon'

export type EuclideanDistance = number
export type EuclideanDistanceRange = [number, number]
export type SemanticDistance = 'VN' | 'N' | 'M' | 'F' | 'VF'
export type SemanticDistanceMap = Record<SemanticDistance, EuclideanDistanceRange>

export type AbsoluteDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type RelativeDirection = 'F' | 'FR' | 'R' | 'BR' | 'B' | 'BL' | 'L' | 'FL'
export type SeManticDirection = AbsoluteDirection | RelativeDirection

export type ComputeRegionRange = 'inside' | 'outside' | 'both'

export type TopologyRelation = 'contain' | 'intersect' | 'disjoint' | 'along'

export interface GeoRelation {
  topology: TopologyRelation
  direction?: number
  distance: EuclideanDistance | EuclideanDistanceRange
  range: ComputeRegionRange
  // NOTE layout model
  layout?: string
  weight: number
}

export interface GeoTriple {
  uuid: string
  role: Role
  origin: string | null
  relation: GeoRelation
  target: string
}

export type SemanticRelation = Omit<GeoRelation, 'weight'>
