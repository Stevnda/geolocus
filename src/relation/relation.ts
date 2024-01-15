import { GeolocusContext } from '@/context'
import { GeolocusObject, IGeoRelation, IGeoTriple } from '@/type'
import { Semantic } from './semantic'
import { IGeoRelationWithSemantic, SemanticMap, SemanticRelation } from './type'

export class Relation {
  private _graph: Map<string, Set<IGeoTriple>>
  private _context: GeolocusContext
  private _semanticMap: SemanticMap

  constructor(context: GeolocusContext) {
    this._graph = new Map()
    this._context = context
    this._semanticMap = new Map()
  }

  getGeoTripleByUUID(uuid: string) {
    return this._graph.get(uuid)
  }

  defineSemanticRelation(name: string, relation: SemanticRelation) {
    Semantic.define(name, relation, this._semanticMap)
  }

  define(
    target: GeolocusObject,
    origin: GeolocusObject,
    relation: Partial<IGeoRelationWithSemantic>,
  ) {
    if (origin.getContext() !== target.getContext()) {
      throw new Error('The context between origin and target is different.')
    }
    const originUUID = origin.getUUID()
    const targetUUID = target.getUUID()
    const route = this._context.getRoute()
    route.addEdge(originUUID, targetUUID)
    const circle = route.topologicalSort()
    if (circle.length !== route.getVertexCount()) {
      throw new Error('Route contains a cycle.')
    }
    const relationSet = this._graph.get(targetUUID)
    const tempTriple: IGeoTriple = {
      origin: originUUID,
      relation: this.transform(relation),
      target: targetUUID,
    }
    if (!relationSet) {
      this._graph.set(targetUUID, new Set([tempTriple]))
    } else {
      relationSet.add(tempTriple)
    }
  }

  private transform(relation: Partial<IGeoRelationWithSemantic>): IGeoRelation {
    if (relation.semantic) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const semantic = this._semanticMap.get(relation.semantic)!
      const direction = semantic.direction || relation.direction
      const distance = semantic.distance || relation.distance
      const topology = semantic.topology || relation.topology
      const result: IGeoRelation = {
        direction: direction || null,
        distance: distance || null,
        topology: topology || null,
        weight: relation.weight || 1,
      }
      return result
    } else {
      const result: IGeoRelation = {
        direction: relation.direction || null,
        distance: relation.distance || null,
        topology: relation.topology || null,
        weight: relation.weight || 1,
      }

      return result
    }
  }
}
