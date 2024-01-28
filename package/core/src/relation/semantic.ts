import { SemanticMap, SemanticRelation } from './type'

export class Semantic {
  static define(
    name: string,
    relation: Partial<SemanticRelation>,
    map: SemanticMap,
  ) {
    const transform = {
      direction: relation.direction || null,
      distance: relation.distance || null,
      topology: relation.topology || null,
    }
    map.set(name, transform)
  }
}
