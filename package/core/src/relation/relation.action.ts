import { GeolocusGeometry, GeolocusObject, JTSGeometryFactory } from '@/object'
import { GeoRelation, GeoTriple } from './relation.type'
import { GeolocusContext, Role, RouteAction } from '@/context'
import { randomUUID } from 'crypto'
import { UserGeolocusTriple, UserGeoRelation } from '..'
import { Distance } from './distance.util'

export class RelationAction {
  static handleOrigin(
    triple: UserGeolocusTriple,
    context: GeolocusContext,
  ): string {
    let { name, type, coord } = triple.origin
    let uuid = context.getObjectUUIDByPlaceName(name)
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
    context.addObject(uuid, object)
    context.addPlaceName(name, uuid)
    return uuid
  }

  static handleTarget(
    triple: UserGeolocusTriple,
    context: GeolocusContext,
  ): string {
    const name = triple.target as string
    let uuid = context.getObjectUUIDByPlaceName(name)
    if (uuid) return uuid
    const jstGeometry = JTSGeometryFactory.empty('Point')
    const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
    const object = new GeolocusObject(geolocusGeometry, name)
    uuid = object.getUUID()
    context.addObject(uuid, object)
    context.addPlaceName(name, uuid)
    return uuid
  }

  // NOTE 修改逻辑关系, 布局模型目前没有搞
  static transform(relation: UserGeoRelation, role: Role): GeoRelation {
    const res: GeoRelation = {
      topology: 'disjoint',
      direction: undefined,
      distance: 0,
      range: 'both',
      semantic: undefined,
      weight: 1,
    }

    // range
    if (relation.topology === 'disjoint') {
      res.range = 'outside'
    } else if (relation.topology === 'contain') {
      res.range = 'inside'
    } else if (relation.topology === 'intersect') {
      if (relation.range) {
        res.range = relation.range
      } else if (typeof relation.distance === 'number') {
        res.range = 'outside'
      } else {
        res.range = 'both'
      }
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
    if (typeof relation.distance === 'number') {
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
      if (res.topology === 'contain') {
        res.distance = 0
      } else if (res.topology === 'disjoint') {
        res.distance = role.getSemanticDistanceMap().VF[1]
      } else if (res.topology === 'intersect') {
        const range = role.getSemanticDistanceMap().M
        res.distance = (range[0] + range[1]) / 2
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
    if (circle.length !== route.getNodeCount()) {
      route.removeEdge(originUUID, targetUUID)
      throw new Error('Route contains a cycle.')
    }

    const tripleTransform: GeoTriple = {
      uuid: randomUUID(),
      role,
      mode: null,
      origin: originUUID,
      relation: this.transform(triple.relation as UserGeoRelation, role),
      target: targetUUID,
    }
    const tripleUUID = randomUUID()
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
