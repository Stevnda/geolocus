import { GeolocusContext } from '@/context'
import { GeolocusObject } from '@/object'
import { IGeoTriple } from '@/region'
import { randomUUID } from 'crypto'
import { Distance } from './distance'
import { Semantic } from './semantic'
import { IGeoRelation, IGeoRelationWithSemantic, SemanticMap } from './type'

export class Relation {
  // the uuid of graph is the same as target geolocusObject
  // the uuid of IGeoRelationMap is auto generate
  private _graph: Map<string, Map<string, IGeoTriple>>
  private _context: GeolocusContext
  private _semanticMap: SemanticMap

  constructor(context: GeolocusContext) {
    this._graph = new Map()
    this._context = context
    this._semanticMap = new Map()
  }

  getRelationByRelationUUID = (uuid: string) => {
    let result: IGeoTriple | undefined
    this._graph.forEach((map) => {
      map.get(uuid) && (result = map.get(uuid))
    })
    return result
  }

  getRelationMapOfObjectByObjectUUID = (uuid: string) => {
    return this._graph.get(uuid)
  }

  defineSemanticRelation = (name: string, relation: Partial<IGeoRelation>) => {
    Semantic.define(name, relation, this._semanticMap)
  }

  define = (
    target: GeolocusObject,
    origin: GeolocusObject,
    relation: Partial<IGeoRelationWithSemantic>,
  ) => {
    const originContext = origin.getContext()
    const targetContext = target.getContext()
    if (!originContext || !targetContext) {
      throw new Error('Origin and target object must define context.')
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (originContext.getUUID() !== targetContext.getUUID()) {
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
    const relationMap = this._graph.get(targetUUID)
    const tempTriple: IGeoTriple = {
      origin: originUUID,
      relation: this.transform(relation, originContext),
      target: targetUUID,
    }
    const tripleUUID = randomUUID()
    if (!relationMap) {
      this._graph.set(targetUUID, new Map([[tripleUUID, tempTriple]]))
    } else {
      relationMap.set(tripleUUID, tempTriple)
    }

    return tripleUUID
  }

  private transform = (
    relation: Partial<IGeoRelationWithSemantic>,
    context: GeolocusContext,
  ): IGeoRelation => {
    if (relation.semantic) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const semantic = this._semanticMap.get(relation.semantic)!
      const direction = semantic.direction || relation.direction
      const distance = semantic.distance || relation.distance
      const distanceTransform =
        distance && Distance.transformSemanticDistance(distance, context)
      const topology = semantic.topology || relation.topology
      const result: IGeoRelation = {
        direction: direction || null,
        distance: distanceTransform || null,
        topology: topology || null,
        weight: relation.weight || 1,
      }
      return result
    } else {
      const distance = relation.distance
      distance && Distance.transformSemanticDistance(distance, context)
      const distanceTransform =
        distance && Distance.transformSemanticDistance(distance, context)
      const result: IGeoRelation = {
        direction: relation.direction || null,
        distance: distanceTransform || null,
        topology: relation.topology || null,
        weight: relation.weight || 1,
      }

      return result
    }
  }
}
