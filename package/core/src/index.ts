import {
  GeolocusGlobalContext,
  GeolocusLocalContext,
  IGeolocusGlobalContextInit,
  IGeolocusLocalContextInit,
  TGeolocusContext,
  TPosition2,
} from './context'
import {
  GeolocusLineStringObject,
  GeolocusObjectStatus,
  GeolocusPointObject,
  GeolocusPolygonObject,
  TGeolocusObject,
} from './object'
import { TRegionStrategy } from './region'
import {
  IGeoRelation,
  IGeoRelationWithSemantic,
  TSemanticRelation,
} from './relation'

interface IGeolocusObjectInit {
  name: string | null
  status: GeolocusObjectStatus | null
}

class Geolocus {
  private _context: TGeolocusContext

  constructor(type: 'local', init: IGeolocusLocalContextInit)
  constructor(type: 'global', init: IGeolocusGlobalContextInit | null)
  constructor(
    type: 'global' | 'local',
    init: IGeolocusLocalContextInit | IGeolocusGlobalContextInit | null,
  ) {
    if (type === 'global') {
      this._context = new GeolocusGlobalContext(init)
    } else {
      this._context = new GeolocusLocalContext(
        init as IGeolocusLocalContextInit,
      )
    }
  }

  createLocalContext(init: IGeolocusGlobalContextInit) {
    return new Geolocus('local', {
      ...init,
      parentContext: this._context,
    })
  }

  point(position: TPosition2, option: IGeolocusObjectInit | null = null) {
    return new GeolocusPointObject(position, {
      context: this._context,
      name: option?.name || '',
      status: option?.status || 'precise',
      bbox: null,
      center: null,
      geometry: null,
      type: null,
      uuid: null,
    })
  }

  lineString(
    position: TPosition2[],
    option: IGeolocusObjectInit | null = null,
  ) {
    return new GeolocusLineStringObject(position, {
      context: this._context,
      name: option?.name || '',
      status: option?.status || 'precise',
      bbox: null,
      center: null,
      geometry: null,
      type: null,
      uuid: null,
    })
  }

  polygon(position: TPosition2[][], option: IGeolocusObjectInit | null = null) {
    return new GeolocusPolygonObject(position, {
      context: this._context,
      name: option?.name || '',
      status: option?.status || 'precise',
      bbox: null,
      center: null,
      geometry: null,
      type: null,
      uuid: null,
    })
  }

  defineSemanticRelation(
    name: string,
    relation: Omit<TSemanticRelation, 'context'>,
  ) {
    const result: IGeoRelation = {
      context: this._context,
      direction: relation.direction || null,
      distance: relation.distance || null,
      topology: relation.topology || null,
      weight: 1,
    }
    const relationFactory = this._context.getRelation()
    relationFactory.defineSemanticRelation(name, result)
  }

  defineRelation(
    target: TGeolocusObject,
    origin: TGeolocusObject,
    relation: Partial<Omit<IGeoRelationWithSemantic, 'context'>>,
  ) {
    const result: IGeoRelationWithSemantic = {
      context: this._context,
      direction: relation.direction || null,
      distance: relation.distance || null,
      topology: relation.topology || null,
      semantic: relation.semantic || null,
      weight: relation.weight || 1,
    }
    this._context.getRelation().define(target, origin, result)
  }

  computeFuzzyObject(object: TGeolocusObject, strategy: TRegionStrategy) {
    const uuid = this._context
      .getRegion()
      .computeFuzzyObject(object.getUUID(), strategy)
    return uuid.map(
      (uuid) => this._context.getObjectByObjectUUID(uuid) as TGeolocusObject,
    )
  }

  getComputeResult(object: TGeolocusObject) {
    return this._context
      .getRegion()
      .getRegionResultByObjectUUID(object.getUUID())
  }
}

const createContext = (
  init: Partial<IGeolocusGlobalContextInit> | null = null,
) => {
  return new Geolocus('global', {
    directionDelta: init?.directionDelta || null,
    distanceDelta: init?.distanceDelta || null,
    name: init?.name || null,
    orientation: init?.orientation || null,
    resultGirdNum: init?.resultGirdNum || null,
    semanticDistanceMap: init?.semanticDistanceMap || null,
  })
}

export const geolocus = {
  createContext,
}
