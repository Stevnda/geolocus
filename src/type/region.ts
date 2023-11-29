import { IGeoRelation } from '.'

export interface IGeoTriple {
  origin: string
  relation: IGeoRelation
  target: string
}
