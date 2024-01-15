import { IGeoRelation } from '@/type'

export type SemanticRelation = Omit<IGeoRelation, 'weight'>
export type SemanticMap = Map<string, SemanticRelation>

export interface IGeoRelationWithSemantic extends IGeoRelation {
  semantic: string | null
}
