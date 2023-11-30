import { GeolocusContext } from '../context'
import { GeolocusObject, IGeoRelation, IGeoTriple } from '../type'
import { IGeoRelationWithSemantic } from './type'

export class Relation {
  private _graph: Map<string, Set<IGeoTriple>>

  constructor() {
    this._graph = new Map()
  }

  define(
    target: GeolocusObject,
    origin: GeolocusObject,
    relation: Partial<IGeoRelationWithSemantic>,
  ) {
    const originUUID = origin.getUUID()
    const targetUUID = target.getUUID()
    const route = GeolocusContext.getRoute()
    route.addEdge(originUUID, targetUUID)
    const circle = route.topologicalSort()
    if (circle.length !== route.getVertexCount()) {
      throw new Error('Route contains a cycle.')
    }
    const isComputed = route.validateFuzzy(targetUUID)
    if (!isComputed) {
      throw new Error('Can not compute the fuzzy.')
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
