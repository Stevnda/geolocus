import { IGeoRelation } from '../type'
export interface IGeoRelationWithSemantic extends IGeoRelation {
  semantic: string | null
}
