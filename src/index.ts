import { GeolocusContext } from './context'
import {
  GeolocusLineStringObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'
import { IGeoRelationWithSemantic } from './relation/type'
import { GeolocusObject, Position2 } from './type'

interface IGeolocusObjectOption {
  name?: string
  fuzzy?: boolean
}

class Geolocus {
  private _context: GeolocusContext
  constructor(name: string) {
    this._context = new GeolocusContext(name)
  }

  point(position: Position2, option?: IGeolocusObjectOption) {
    return new GeolocusPointObject(position, this._context, {
      name: option?.name || '',
      fuzzy: option?.fuzzy || false,
    })
  }

  lineString(position: Position2[], option?: IGeolocusObjectOption) {
    return new GeolocusLineStringObject(position, this._context, {
      name: option?.name || '',
      fuzzy: option?.fuzzy || false,
    })
  }

  polygon(position: Position2[][], option?: IGeolocusObjectOption) {
    return new GeolocusPolygonObject(position, this._context, {
      name: option?.name || '',
      fuzzy: option?.fuzzy || false,
    })
  }

  defineRelation(
    target: GeolocusObject,
    origin: GeolocusObject,
    relation: Partial<IGeoRelationWithSemantic>,
  ) {
    this._context.getRelation().define(target, origin, relation)
  }

  computeFuzzyObject(object: GeolocusObject) {
    const uuid = this._context.getRegion().computeFuzzyObject(object.getUUID())
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
