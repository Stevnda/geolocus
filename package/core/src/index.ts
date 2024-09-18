import {
  AbsoluteDirection,
  ComputeRegionRange,
  EuclideanDistance,
  EuclideanDistanceRange,
  RelativeDirection,
  SemanticDistanceMap,
  TopologyRelation,
} from './relation'
import { GeolocusContext, GeolocusContextInit, Role } from './context'
import { GeolocusPlugin, PlacePlugin } from './context/plugin'
import { GeolocusGeometryType, GeolocusObject, Position2 } from './object'
import { RelationAction } from './relation/relation.action'
import { Region } from './region'
import { SemanticDistance } from './relation/relation.type'

export interface UserGeoRelation {
  topology?: TopologyRelation
  direction?: AbsoluteDirection | RelativeDirection
  distance?: EuclideanDistance | EuclideanDistanceRange | SemanticDistance
  range?: ComputeRegionRange
  semantic?: string
  layout?: string
}

export interface UserGeolocusTriple {
  role: string
  origin: {
    name: string
    type?: GeolocusGeometryType
    coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
  }
  relation?: UserGeoRelation
  target?: string
}

export interface RoleInit {
  name: string
  orientation: number
  directionDelta: number
  distanceDelta: number
  semanticDistanceMap: SemanticDistanceMap
  weight: number
}

class Geolocus {
  private _context: GeolocusContext

  constructor(init: GeolocusContextInit) {
    this._context = new GeolocusContext(init)
  }

  use(type: GeolocusPlugin, fn: PlacePlugin) {
    this._context.getPluginMap().set(type, fn)
  }

  addRole(init: RoleInit) {
    const roleMap = this._context.getRoleMap()
    if (roleMap.has(init.name)) {
      throw Error('the name of role is used')
    }
    const role = new Role(
      init.name,
      init.orientation,
      init.directionDelta,
      init.distanceDelta,
      init.semanticDistanceMap,
      init.weight,
      this._context,
    )
    roleMap.set(init.name, role)
  }

  defineRelation(tripleList: UserGeolocusTriple[]) {
    for (const triple of tripleList) {
      RelationAction.defineTriple(triple, this._context)
    }
  }

  computeFuzzyPointObject(placeName: string) {
    const objectMap = this._context.getObjectMap()
    const uuid = objectMap.getObjectByPlaceName(placeName)?.getUUID() as string
    if (!uuid) return null
    const uuidList = Region.computeFuzzyPointObject(uuid, this._context)
    return uuidList.map((value) => {
      const object = objectMap.getObjectByUUID(value) as GeolocusObject

      return { name: object.getName(), uuid: object.getUUID() }
    })
  }

  computeFuzzyLineObject(lineName: string, relationList: UserGeolocusTriple[]) {
    const result = Region.computeFuzzyLineObject(
      lineName,
      relationList,
      this._context,
    )

    return result
  }

  getComputeResult(placeName: string) {
    const objectMap = this._context.getObjectMap()
    const uuid = objectMap.getObjectByPlaceName(placeName)?.getUUID() as string
    if (!uuid) return null
    return this._context.getRegionResultByObjectUUID(uuid) || null
  }
}

const createContext = (init: GeolocusContextInit) => {
  return new Geolocus(init)
}

export const geolocus = {
  createContext,
}
