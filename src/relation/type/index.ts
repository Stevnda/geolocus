export type SemanticRelation = Omit<IGeoRelation, 'weight'>
export type SemanticMap = Map<string, SemanticRelation>

export interface IGeoRelationWithSemantic extends IGeoRelation {
  semantic: string | null
}

export type EuclideanDistance = number
export type EuclideanDistanceRange = [number, number]
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

export type TopologyRelation =
  | 'equal'
  | 'intersect'
  | 'disjoint'
  | 'contain'
  // | 'within'
  | 'touch'

export interface IGeoRelation {
  topology: TopologyRelation | null
  direction: AbsoluteDirection | null
  distance: EuclideanDistance | EuclideanDistanceRange | null
  weight: number
}
