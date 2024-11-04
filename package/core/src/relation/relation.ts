import { GeolocusContext, ObjectMapAction, Role, RouteAction } from '@/context'
import { GeoRelation, GeoTriple, SemanticRelation } from './relation.type'
import { JTSGeometryFactory, GeolocusGeometry, GeolocusObject } from '@/object'
import { generateUUID, GEO_MAX_VALUE } from '@/util'
import { UserGeolocusTriple, UserGeoRelation } from '..'
import { Distance } from './distance'

export class Relation {
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
  static getTripleListByUUID(relation: Relation, uuid: string): GeoTriple[] {
    const tripleListMap = relation.getTripleListMap()
    const res = tripleListMap.get(uuid)
    if (res) return [...res]
    else return []
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
    } else {
      res.range = 'both'
    }

    // topology
    if (relation.topology) {
      res.topology = relation.topology
    } else {
      res.topology = 'contain'
    }
    // direction
    res.direction = relation.direction
    // distance
    if (relation.distance != null) {
      const distanceTransform = Distance.transformDistance(relation.distance, role.getSemanticDistanceMap())
      res.distance = distanceTransform
    } else {
      if (res.topology === 'disjoint') {
        res.distance = [0, GEO_MAX_VALUE]
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
      relation: this.transform(triple.relation || {}, role),
      target: targetUUID,
    }
    const tripleUUID = generateUUID()
    const relation = context.getRelation()
    const relationSet = relation.getTripleListMap().get(targetUUID)
    if (!relationSet) {
      const tripleListMap = relation.getTripleListMap()
      tripleListMap.set(targetUUID, new Set([tripleTransform]))
    } else {
      relationSet.add(tripleTransform)
    }

    return tripleUUID
  }

  private static handleOrigin(triple: UserGeolocusTriple, context: GeolocusContext): string {
    let { name, type, coord } = triple.origin
    const objectMap = context.getObjectMap()

    let obj: GeolocusObject
    if (type != null && coord != null) {
      obj = new GeolocusObject(
        new GeolocusGeometry(type, JTSGeometryFactory.create(type, coord)),
        name,
        null,
        'precise',
      )
    } else {
      name = <string>name
      const temp = ObjectMapAction.getObjectByPlaceName(objectMap, name)
      if (temp == null) {
        const jstGeometry = JTSGeometryFactory.empty('Point')
        const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
        obj = new GeolocusObject(geolocusGeometry, name, null, 'fuzzy')
      } else {
        obj = temp
      }
    }

    const uuid = obj.getUUID()
    ObjectMapAction.addObject(objectMap, obj)

    return uuid
  }

  private static handleTarget(triple: UserGeolocusTriple, context: GeolocusContext): string {
    const name = triple.target as string
    const objectMap = context.getObjectMap()
    const pluginList = objectMap.getPlacePluginList()
    const defaultPlugin = pluginList[0]

    const res = defaultPlugin(name)
    if (res?.object != null) return res.object.getUUID()

    const jstGeometry = JTSGeometryFactory.empty('Point')
    const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
    const obj = new GeolocusObject(geolocusGeometry, name, null, 'fuzzy')

    const uuid = obj.getUUID()
    ObjectMapAction.addObject(objectMap, obj)
    console.log(uuid)

    return uuid
  }
}
