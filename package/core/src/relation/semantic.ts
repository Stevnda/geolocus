import { TSemanticMap, TSemanticRelation } from './relation.type'

export class Semantic {
  static define(name: string, relation: TSemanticRelation, map: TSemanticMap) {
    map.set(name, relation)
  }
}
