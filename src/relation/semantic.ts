import { SemanticMap, SemanticRelation } from './type'

export class Semantic {
  static define(name: string, relation: SemanticRelation, map: SemanticMap) {
    map.set(name, relation)
  }
}
