import {
  AbsoluteDirection,
  ComputeRegionRange,
  EuclideanDistance,
  EuclideanDistanceRange,
  RelativeDirection,
  SemanticDistanceMap,
  TopologyRelation,
  GeoTriple,
  SemanticDistance,
  RelationAction,
} from './relation'
import { GeolocusContext, GeolocusContextInit, PlacePlugin, Role } from './context'
import { GeolocusGeometryType, GeolocusObject, Position2 } from './object'
import { Region, RegionResult } from './region'
import { GeoJSON } from 'geojson'
import { GeoJson } from './io'
import { ObjectMapAction } from './context/objectMap'

export interface UserGeoRelation {
  topology?: TopologyRelation
  direction?: AbsoluteDirection | RelativeDirection
  distance?: EuclideanDistance | EuclideanDistanceRange | SemanticDistance
  range?: ComputeRegionRange
  layout?: string
}

export interface UserGeolocusTriple {
  role: string
  origin: {
    name?: string
    type?: GeolocusGeometryType
    coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
  }
  relation?: UserGeoRelation
  target: string
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

  use(type: 'placePlugin', fn: PlacePlugin) {
    if (type === 'placePlugin') {
      const objectMap = this._context.getObjectMap()
      const pluginList = objectMap.getPlacePluginList()
      objectMap.setPlacePluginList([...pluginList, fn])
    }
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
    const object = ObjectMapAction.getObjectByPlaceName(objectMap, placeName)
    if (object?.getStatus() === 'precise') {
      return { name: object.getName(), uuid: object.getUUID() }
    }
    const uuid = object?.getUUID()
    if (!uuid) return null
    const uuidList = Region.computeFuzzyPointObject(uuid, this._context)
    return uuidList.map((value) => {
      const object = <GeolocusObject>ObjectMapAction.getObjectByUUID(objectMap, value)
      return { name: object.getName(), uuid: object.getUUID() }
    })
  }

  computeFuzzyLineObject(lineName: string): {
    lineString: GeolocusObject
    resultList: RegionResult[]
    tripleList: GeoTriple[]
  } {
    const result = Region.computeFuzzyLineObject(lineName, this._context)

    return result
  }

  getComputeResult(placeName: string) {
    const objectMap = this._context.getObjectMap()
    const uuid = ObjectMapAction.getObjectByPlaceName(objectMap, placeName)?.getUUID()
    if (uuid == null) return null
    return this._context.getRegionResultByObjectUUID(uuid) || null
  }

  toGeoJSON(object: GeolocusObject): GeoJSON {
    const geometry = object.getGeometry()
    return GeoJson.stringify(geometry)
  }
}

const createContext = (init: GeolocusContextInit) => {
  return new Geolocus(init)
}

export const geolocus = {
  createContext,
}
