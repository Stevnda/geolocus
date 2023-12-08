import { GeolocusContext } from '../context'
import { GeolocusObject, IGeoRelation, IGeoTriple } from '../type'
import { IGeoRelationWithSemantic } from './relation.type'

export class Relation {
  private _graph: Map<string, Set<IGeoTriple>>
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._graph = new Map()
    this._context = context
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

  getGeoTripleByUUID(uuid: string) {
    return this._graph.get(uuid)
  }

  private transform(relation: Partial<IGeoRelationWithSemantic>): IGeoRelation {
    const result: IGeoRelation = {
      direction: relation.direction || null,
      distance: relation.distance || null,
      topology: relation.topology || null,
    }
    return result
  }
}
