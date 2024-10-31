import { GeolocusContext, Role, RouteAction } from '@/context'
import { GeoRelation, GeoTriple, SemanticRelation } from './relation.type'
import { JTSGeometryFactory, GeolocusGeometry, GeolocusObject } from '@/object'
import { generateUUID } from '@/util'
import { UserGeolocusTriple, UserGeoRelation } from '..'
import { Distance } from './distance'

interface RelationProps {
  setTripleListMap(value: Map<string, Set<GeoTriple>>): void
  getTripleListMap(): Map<string, Set<GeoTriple>>
  getTripleListOfObject(objectUUID: string): Set<GeoTriple> | null
  setSemanticMap(value: Map<string, SemanticRelation>): void
  getSemanticMap(): Map<string, SemanticRelation>
  setContext(value: GeolocusContext): void
  getContext(): GeolocusContext
}

export class Relation implements RelationProps {
  // the uuid of tripleListMap is the same as geolocusObject
  // the uuid of tripleList is auto generate
  private _tripleListMap: Map<string, Set<GeoTriple>>
  private _semanticMap: Map<string, SemanticRelation>
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._tripleListMap = new Map()
    this._semanticMap = new Map()
    this._context = context
  }

  setTripleListMap(value: Map<string, Set<GeoTriple>>): void {
    this._tripleListMap = value
  }

  getTripleListMap(): Map<string, Set<GeoTriple>> {
    return this._tripleListMap
  }

  getTripleListOfObject(objectUUID: string): Set<GeoTriple> | null {
    return this._tripleListMap.get(objectUUID) || null
  }

  setSemanticMap(value: Map<string, SemanticRelation>): void {
    this._semanticMap = value
  }

  getSemanticMap(): Map<string, SemanticRelation> {
    return this._semanticMap
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }

  getContext(): GeolocusContext {
    return this._context
  }
}

export class RelationAction {
  static handleOrigin(
    triple: UserGeolocusTriple,
    context: GeolocusContext,
  ): string {
    let { name, type, coord } = triple.origin
    const objectMap = context.getObjectMap()
    let uuid = objectMap.getObjectByPlaceName(name)?.getUUID()
    if (uuid) return uuid
    if (coord == null || type == null) {
      const placePlugin = context.getPlugin('place')
      // TODO place is always has result
      const { type: resultType, coord: resultCoord } = placePlugin(name)
      type = resultType
      coord = resultCoord
    }
    const jstGeometry = JTSGeometryFactory.create(type, coord)
    const geolocusGeometry = new GeolocusGeometry(type, jstGeometry)
    const object = new GeolocusObject(geolocusGeometry, name)
    uuid = object.getUUID()
    objectMap.addObject(object)
    return uuid
  }

  static handleTarget(
    triple: UserGeolocusTriple,
    context: GeolocusContext,
  ): string {
    const name = triple.target as string
    const objectMap = context.getObjectMap()
    let uuid = objectMap.getObjectByPlaceName(name)?.getUUID()
    if (uuid) return uuid
    const jstGeometry = JTSGeometryFactory.empty('Point')
    const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
    const object = new GeolocusObject(geolocusGeometry, name, null, 'fuzzy')
    uuid = object.getUUID()
    objectMap.addObject(object)
    return uuid
  }

  // NOTE 修改逻辑关系, 布局模型目前没有搞
  static transform(relation: UserGeoRelation, role: Role): GeoRelation {
    const res: GeoRelation = {
      topology: 'disjoint',
      direction: undefined,
      distance: 0,
      range: 'outside',
      semantic: undefined,
      weight: 1,
    }

    // range
    if (relation.range) {
      res.range = relation.range
    } else if (relation.topology === 'disjoint') {
      res.range = 'outside'
    } else if (relation.topology === 'contain') {
      res.range = 'inside'
    } else if (relation.topology === 'intersect') {
      res.range = 'outside'
    }

    // topology
    if (relation.topology) {
      res.topology = relation.topology
    } else {
      res.topology = 'disjoint'
    }
    // direction
    res.direction = relation.direction
    // distance
    // NOTE 无限距离的设置
    if (relation.distance != null) {
      let distanceTransform = Distance.transformDistance(
        relation.distance,
        role.getSemanticDistanceMap(),
      )
      if (
        distanceTransform instanceof Array &&
        relation.topology !== 'disjoint'
      ) {
        distanceTransform = (distanceTransform[0] + distanceTransform[1]) / 2
      }
      res.distance = distanceTransform
    } else {
      if (res.topology === 'disjoint') {
        res.distance = [0, role.getSemanticDistanceMap().VF[1]]
      } else {
        res.distance = 0
      }
    }

    // weight
    res.weight = role.getWeight()

    return res
  }

  static defineTriple(triple: UserGeolocusTriple, context: GeolocusContext) {
    const role = context.getRoleMap().get(triple.role)
    if (!role) throw new Error('role is not existed')
    const originUUID = this.handleOrigin(triple, context)
    const targetUUID = this.handleTarget(triple, context)

    const route = context.getRoute()
    route.addEdge(originUUID, targetUUID)
    const circle = RouteAction.validateRouteValidity(route)
    if (!circle[0]) {
      route.removeEdge(originUUID, targetUUID)
      throw new Error('Route contains a cycle.')
    }

    const tripleTransform: GeoTriple = {
      uuid: generateUUID(),
      role,
      origin: originUUID,
      relation: this.transform(triple.relation as UserGeoRelation, role),
      target: targetUUID,
    }
    const tripleUUID = generateUUID()
    const relation = context.getRelation()
    const relationSet = relation.getTripleListOfObject(targetUUID)
    if (!relationSet) {
      const tripleListMap = relation.getTripleListMap()
      tripleListMap.set(targetUUID, new Set([tripleTransform]))
    } else {
      relationSet.add(tripleTransform)
    }

    return tripleUUID
  }
}
