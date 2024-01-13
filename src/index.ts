import { GeolocusContext } from './context'
import {
  GeolocusLineStringObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'
import { IGeoRelationWithSemantic } from './relation/type'
import { GeolocusObject, GeolocusObjectStatus, Position2 } from './type'

interface IGeolocusObjectInit {
  name?: string
  status?: GeolocusObjectStatus
}

class Geolocus {
  private _context: GeolocusContext
  constructor(name: string) {
    this._context = new GeolocusContext(name)
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

  defineRelation(
    target: GeolocusObject,
    origin: GeolocusObject,
    relation: Partial<IGeoRelationWithSemantic>,
  ) {
    this._context.getRelation().define(target, origin, relation)
  }

  computeFuzzyObject(
    object: GeolocusObject,
    strategy: 'intersection' | 'union' = 'intersection',
  ) {
    const uuid = this._context
      .getRegion()
      .computeFuzzyObject(object.getUUID(), strategy)
    return uuid.map(
      (uuid) => this._context.getObjectByUUID(uuid) as GeolocusObject,
    )
  }

  getComputeResult(object: GeolocusObject) {
    return this._context.getRegion().getResultByUUID(object.getUUID())
  }
}

const createContext = (name: string) => new Geolocus(name)

export const geolocus = {
  createContext,
}
