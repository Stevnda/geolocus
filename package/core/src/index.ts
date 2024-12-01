import {
  ComputeRegionRange,
  EuclideanDistance,
  EuclideanDistanceRange,
  SemanticDistanceMap,
  TopologyRelation,
  SemanticDistance,
  RelationAction,
  SemanticDirection,
  RelationMode,
} from './relation'
import {
  GeolocusContext,
  GeolocusContextInit,
  PlacePlugin,
  Role,
  ObjectMapAction,
  createSpatialRefFromEPSG,
  SpatialRef,
} from './context'
import { GeolocusGeometryType, GeolocusObject, Position2 } from './object'
import { Region, RegionResult } from './region'
import { GeoJSON } from 'geojson'
import { IO } from './io'
import { GeoLayout } from './relation/layout.type'
import { generateUUID } from './util'

export interface UserGeoRelation {
  topology?: TopologyRelation
  direction?: SemanticDirection | number // [0,360], N=0
  distance?: EuclideanDistance | EuclideanDistanceRange | SemanticDistance
  range?: ComputeRegionRange
  layout?: GeoLayout
}

export interface UserGeolocusTripleOrigin {
  name?: string
  type?: GeolocusGeometryType
  coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export interface UserGeolocusTriple {
  role: string
  originList?: (UserGeolocusTripleOrigin | UserGeolocusTriple)[]
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
  spatialRef: SpatialRef
  isDefault?: boolean
}

export class Geolocus {
  private _context: GeolocusContext

  constructor(init: GeolocusContextInit) {
    this._context = new GeolocusContext(init)
  }

  getContext(): GeolocusContext {
    return this._context
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
      init.spatialRef,
      init.isDefault || false,
      this._context,
    )
    roleMap.set(init.name, role)
  }

  defineRelation(tripleList: UserGeolocusTriple[], mode: RelationMode) {
    for (const triple of tripleList) {
      RelationAction.defineTriple(triple, this._context, mode)
    }
  }

  computeFuzzyPointObject(placeName: string): RegionResult | null {
    const objectMap = this._context.getObjectMap()
    const object = ObjectMapAction.getObjectByPlaceName(objectMap, placeName)
    if (object?.getStatus() === 'precise') {
      return null
    }
    const uuid = object?.getUUID()
    if (!uuid) return null
    const res = Region.computeFuzzyPointObject(uuid, this._context)

    return res
  }

  computeFuzzyLineObject(placeName: string): RegionResult | null {
    const objectMap = this._context.getObjectMap()
    const object = ObjectMapAction.getObjectByPlaceName(objectMap, placeName)
    if (object?.getStatus() === 'precise') {
      return null
    }

    const uuid = object?.getUUID()
    if (!uuid) return null
    const result = Region.computeFuzzyLineObject(uuid, this._context)

    return result
  }

  computeFuzzyPolygonObject(placeName: string): RegionResult | null {
    const objectMap = this._context.getObjectMap()
    const object = ObjectMapAction.getObjectByPlaceName(objectMap, placeName)
    if (object?.getStatus() === 'precise') {
      return null
    }

    const uuid = object?.getUUID()
    if (!uuid) return null
    const result = Region.computeFuzzyPolygonObject(uuid, this._context)

    return result
  }

  getComputeResult(placeName: string) {
    const objectMap = this._context.getObjectMap()
    const uuid = ObjectMapAction.getObjectByPlaceName(
      objectMap,
      placeName,
    )?.getUUID()
    if (uuid == null) return null
    return this._context.getRegionResultByObjectUUID(uuid) || null
  }

  toGeoJSON(object: GeolocusObject): GeoJSON {
    const geometry = object.getGeometry()
    return IO.geomToGeoJSON(geometry)
  }
}

const createContext = (init: GeolocusContextInit): Geolocus => {
  return new Geolocus(init)
}

export const geolocus = {
  createContext,
  createSpatialRefFromEPSG,
  generateUUID,
}
