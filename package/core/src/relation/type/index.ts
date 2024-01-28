import { GeolocusContext } from '@/context'

export type EuclideanDistance = number
export type EuclideanDistanceRange = [number, number]

export interface IDistanceNormalization {
  max: number
  min: number
  mean: number
  range: number
}

export type SemanticDistance = 'VN' | 'N' | 'M' | 'F' | 'VF'
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

export type DirectionAndDistanceTag = 'inside' | 'outside' | 'both'

export type TopologyRelation = 'equal' | 'intersect' | 'disjoint' | 'contain'

export interface IGeoRelation {
  context: GeolocusContext
  topology: TopologyRelation | null
  direction: AbsoluteDirection | RelativeDirection | null
  distance: EuclideanDistance | EuclideanDistanceRange | null
  weight: number
}

export interface IGeoRelationWithSemantic {
  context: GeolocusContext
  topology: TopologyRelation | null
  direction: AbsoluteDirection | RelativeDirection | null
  distance: SemanticDistance | EuclideanDistance | EuclideanDistanceRange | null
  semantic: string | null
  weight: number
}

export type SemanticRelation = Omit<IGeoRelation, 'weight'>
export type SemanticMap = Map<string, SemanticRelation>
