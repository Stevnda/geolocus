import { GeolocusObject } from '@/object'
import { Relation } from './relation.actor'
import { GeoRelation, GeoTriple } from './relation.type'
import { Role, RouteAction } from '@/context'
import { randomUUID } from 'crypto'

export class RelationAction {
  static defineSemanticRelation(
    relation: Relation,
    name: string,
    geoRelation: GeoRelation,
  ) {
    const map = relation.getSemanticMap()
    map.set(name, geoRelation)
  }

  static defineTriple(
    relation: Relation,
    target: GeolocusObject,
    origin: GeolocusObject,
    geoRelation: GeoRelation,
    role: Role,
  ) {
    const originUUID = origin.getUUID()
    const targetUUID = target.getUUID()
    const route = role.getContext().getRoute()
    route.addEdge(originUUID, targetUUID)
    const circle = RouteAction.validateRouteValidity(route)
    if (circle.length !== route.getNodeCount()) {
      throw new Error('Route contains a cycle.')
    }

    const tripleTransform: GeoTriple = {
      uuid: randomUUID(),
      role,
      origin: originUUID,
      relation: this.transform(geoRelation, role),
      target: targetUUID,
    }
    const tripleUUID = randomUUID()
    const relationSet = relation.getTripleListOfObject(targetUUID)
    if (!relationSet) {
      const tripleListMap = relation.getTripleListMap()
      tripleListMap.set(targetUUID, new Set([tripleTransform]))
    } else {
      relationSet.add(tripleTransform)
    }

    return tripleUUID
  }

  // NOTE
  static transform(relation: GeoRelation, role: Role): GeoRelation {
    console.log(role)
    return relation
  }
}
