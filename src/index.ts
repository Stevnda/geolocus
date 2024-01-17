import { GeolocusContext, IGeolocusContextInit, Position2 } from './context'
import {
  GeolocusLineStringObject,
  GeolocusObject,
  GeolocusObjectStatus,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'
import { RegionStrategy } from './region'
import { IGeoRelationWithSemantic, SemanticRelation } from './relation'

interface IGeolocusObjectInit {
  name?: string
  status?: GeolocusObjectStatus
}

class Geolocus {
  private _context: GeolocusContext

  constructor(init?: IGeolocusContextInit) {
    this._context = new GeolocusContext(init)
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

  defineSemanticRelation(name: string, relation: SemanticRelation) {
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

const createContext = (init?: IGeolocusContextInit) => new Geolocus(init)

export const geolocus = {
  createContext,
}
