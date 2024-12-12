import {
  GeolocusContext,
  ObjectMapAction,
  Role,
  RouteAction,
  SpatialRef,
} from '@/context'
import {
  GeoRelation,
  GeoTriple,
  RelationMode,
  RelationTriple,
  SemanticRelation,
} from './relation.type'
import { JTSGeometryFactory, GeolocusGeometry, GeolocusObject } from '@/object'
import { generateUUID } from '@/util'
import {
  UserGeolocusTriple,
  UserGeolocusTripleOrigin,
  UserGeoRelation,
} from '..'
import { Distance } from './distance'
import { Direction } from './direction'

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

  static defineTriple(
    triple: UserGeolocusTriple,
    context: GeolocusContext,
    mode: RelationMode,
  ): string {
    const role = context.getRoleByName(triple.role)
    if (!role) throw new Error('role is not existed')

    const targetUUID = this.handleTarget(triple.target, context)
    for (const tuple of triple.tupleList) {
      const tempTriple: RelationTriple = {
        role: triple.role,
        originList: tuple.originList,
        relation: tuple.relation,
        target: triple.target,
      }

      const originUUIDList = (() => {
        // 处理 line 中无 origin 的情况, 将上一三元组计算区域作为 origin, 后续会处理
        if (tempTriple.originList == null && mode === 'line') return null
        else return this.handleOrigin(tempTriple, context, mode)
      })()

      // 添加至路由
      if (originUUIDList != null) {
        const route = context.getRoute()
        for (const originUUID of originUUIDList) {
          route.addEdge(originUUID, targetUUID, 'calculation')
          const circle = RouteAction.validateRouteValidity(route)
          if (!circle[0]) {
            route.removeEdge(originUUID, targetUUID)
            throw new Error('Route contains a cycle.')
          }
        }
      }

      // 添加至三元组映射
      const tripleTransform: GeoTriple = {
        uuid: generateUUID(),
        role,
        originUUIDList,
        relation: this.transform(tempTriple.relation || {}, role, mode),
        targetUUID,
      }
      const relation = context.getRelation()
      const relationSet = relation.getTripleListMap().get(targetUUID)
      if (!relationSet) {
        const tripleListMap = relation.getTripleListMap()
        tripleListMap.set(targetUUID, new Set([tripleTransform]))
      } else {
        relationSet.add(tripleTransform)
      }
    }

    return targetUUID
  }

  private static handleOrigin(
    triple: RelationTriple,
    context: GeolocusContext,
    mode: RelationMode,
  ): string[] {
    const uuidList: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (let origin of triple.originList!) {
      if ('role' in origin) {
        const triple = <UserGeolocusTriple>origin
        const targetUUID = RelationAction.defineTriple(triple, context, mode)
        uuidList.push(targetUUID)
      } else {
        origin = <UserGeolocusTripleOrigin>origin
        let { name, type, coord } = origin
        const objectMap = context.getObjectMap()
        let obj: GeolocusObject | null = null

        if (type != null && coord != null) {
          if (name != null) {
            obj = ObjectMapAction.getObjectByPlaceName(objectMap, name)
          }
          if (obj == null) {
            obj = new GeolocusObject(
              new GeolocusGeometry(
                type,
                JTSGeometryFactory.create(type, coord),
              ),
              { name },
            )
          }
        } else {
          name = <string>name
          obj = ObjectMapAction.getObjectByPlaceName(objectMap, name)
          if (obj == null) {
            const jstGeometry = JTSGeometryFactory.empty('Point')
            const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
            obj = new GeolocusObject(geolocusGeometry, {
              name,
              status: 'fuzzy',
            })
          }
        }

        const uuid = obj.getUUID()
        ObjectMapAction.addObject(objectMap, obj)
        uuidList.push(uuid)
      }
    }

    return uuidList
  }

  private static handleTarget(
    targetName: string,
    context: GeolocusContext,
  ): string {
    const objectMap = context.getObjectMap()
    const pluginList = objectMap.getPlacePluginList()
    const defaultPlugin = pluginList[0]

    // NOTE SpatialRef 处理
    const res = defaultPlugin(targetName, <SpatialRef>(<unknown>'test'))
    if (res?.object != null) return res.object.getUUID()

    const jstGeometry = JTSGeometryFactory.empty('Point')
    const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
    const obj = new GeolocusObject(geolocusGeometry, {
      name: targetName,
      status: 'fuzzy',
    })

    const uuid = obj.getUUID()
    ObjectMapAction.addObject(objectMap, obj)

    return uuid
  }

  static transform(
    relation: UserGeoRelation,
    role: Role,
    mode: RelationMode,
  ): GeoRelation {
    const res: GeoRelation = {
      topology: 'disjoint',
      direction: undefined,
      distance: 0,
      range: 'outside',
      layout: undefined,
      weight: 1,
    }

    // range
    if (relation.range != null) {
      res.range = relation.range
    } else {
      res.range = 'both'
    }

    // topology
    if (relation.topology != null) {
      res.topology = relation.topology
    } else if (mode === 'point') {
      res.topology = 'disjoint'
    } else {
      res.topology = 'contain'
    }

    // direction
    if (relation.direction != null) {
      res.direction = Direction.transform(relation.direction, role)
    }

    // distance
    const maxDistance = role.getContext().getMaxDistance()
    if (relation.topology === 'within') {
      relation.distance = 0
    } else if (relation.distance != null) {
      const distanceTransform = Distance.transformDistance(
        relation.distance,
        role.getSemanticDistanceMap(),
      )
      // 最大距离处理
      if (typeof distanceTransform === 'number') {
        res.distance =
          distanceTransform <= maxDistance ? distanceTransform : maxDistance
      } else {
        const [min, max] = distanceTransform
        res.distance =
          max <= maxDistance ? distanceTransform : [min, maxDistance]
      }
    } else if (res.topology === 'disjoint' || res.topology === 'toward') {
      // 无限距离处理
      res.distance = [0, maxDistance + Math.PI]
    } else {
      res.distance = 0
    }

    // layout
    res.layout = relation.layout

    // weight
    res.weight = role.getWeight()

    return res
  }
}
