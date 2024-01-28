import {
  GeolocusContext,
  GeolocusGlobalContext,
  IGeolocusContextInit,
  Position2,
} from './context'
import { GeolocusLocalContext } from './context/context'
import {
  GeolocusLineStringObject,
  GeolocusObject,
  GeolocusObjectStatus,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'
import { RegionStrategy } from './region'
import { IGeoRelation, IGeoRelationWithSemantic } from './relation'

interface IGeolocusObjectInit {
  name?: string
  status?: GeolocusObjectStatus
}

class Geolocus {
  private _context: GeolocusContext

  constructor(type: 'local', init: IGeolocusContextInit)
  constructor(
    type: 'global',
    init?: Omit<IGeolocusContextInit, 'parentContext'>,
  )
  constructor(type: 'global' | 'local', init: IGeolocusContextInit) {
    if (type === 'global') {
      this._context = new GeolocusGlobalContext(init)
    } else {
      this._context = new GeolocusLocalContext(init)
    }
  }

  createLocalContext(init: Omit<IGeolocusContextInit, 'parentContext'>) {
    return new Geolocus('local', {
      parentContext: this._context,
      ...init,
    })
  }

  point(position: Position2, option?: IGeolocusObjectInit) {
    return new GeolocusPointObject(position, {
      context: this._context,
      name: option?.name || '',
      status: option?.status || 'precise',
    })
  }

  lineString(position: Position2[], option?: IGeolocusObjectInit) {
    return new GeolocusLineStringObject(position, {
      context: this._context,
      name: option?.name || '',
      status: option?.status || 'precise',
    })
  }

  polygon(position: Position2[][], option?: IGeolocusObjectInit) {
    return new GeolocusPolygonObject(position, {
      context: this._context,
      name: option?.name || '',
      status: option?.status || 'precise',
    })
  }

  defineSemanticRelation(name: string, relation: Partial<IGeoRelation>) {
    const relationFactory = this._context.getRelation()
    relationFactory.defineSemanticRelation(name, relation)
  }

  defineRelation(
    target: GeolocusObject,
    origin: GeolocusObject,
    relation: Partial<IGeoRelationWithSemantic>,
  ) {
    this._context.getRelation().define(target, origin, relation)
  }

  computeFuzzyObject(object: GeolocusObject, strategy: RegionStrategy) {
    const uuid = this._context
      .getRegion()
      .computeFuzzyObject(object.getUUID(), strategy)
    return uuid.map(
      (uuid) => this._context.getObjectByObjectUUID(uuid) as GeolocusObject,
    )
  }

  getComputeResult(object: GeolocusObject) {
    return this._context
      .getRegion()
      .getRegionResultByObjectUUID(object.getUUID())
  }
}

const createContext = (init?: Omit<IGeolocusContextInit, 'parentContext'>) => {
  return new Geolocus('global', init)
}

export const geolocus = {
  createContext,
}
