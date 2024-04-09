import { TGeolocusContext } from '@/context'

export type TEuclideanDistance = number
export type TEuclideanDistanceRange = [number, number]

export interface IDistanceNormalization {
  max: number
  min: number
  mean: number
  range: number
}

export type TSemanticDistance = 'VN' | 'N' | 'M' | 'F' | 'VF'
export type TAbsoluteDirection =
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW'
export type TRelativeDirection =
  | 'F'
  | 'FR'
  | 'R'
  | 'BR'
  | 'B'
  | 'BL'
  | 'L'
  | 'FL'

export type TIsInsideTag = 'inside' | 'outside' | 'both'

export type TTopologyRelation = 'equal' | 'intersect' | 'disjoint' | 'contain'

export interface IGeoRelation {
  context: TGeolocusContext
  topology: TTopologyRelation | null
  direction: TAbsoluteDirection | TRelativeDirection | null
  distance: TEuclideanDistance | TEuclideanDistanceRange | null
  weight: number
}

export interface IGeoRelationWithSemantic {
  context: TGeolocusContext
  topology: TTopologyRelation | null
  direction: TAbsoluteDirection | TRelativeDirection | null
  distance:
    | TSemanticDistance
    | TEuclideanDistance
    | TEuclideanDistanceRange
    | null
  semantic: string | null
  weight: number
}

export type TSemanticRelation = Omit<IGeoRelation, 'weight'>
export type TSemanticMap = Map<string, TSemanticRelation>
