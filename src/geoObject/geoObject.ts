import crypto from 'crypto'
import { GeolocusGeometry } from '../geometry'
import { Group, Route } from '../meta'

interface IGeoObjectTrait {
  getUUID(): string
  getType(): 'Point' | 'BBox' | 'LineString' | 'Polygon'
  getGeometry(): GeolocusGeometry
  clone(): GeoObject
}

export class GeoObject implements IGeoObjectTrait {
  private _type: 'Point' | 'BBox' | 'LineString' | 'Polygon'
  private _uuid: string
  private _geometry: GeolocusGeometry
  private _route: Route
  private _group: Group

  constructor(geometry: GeolocusGeometry) {
    this._type = geometry.getType()
    this._uuid = crypto.randomUUID()
    this._geometry = geometry
    this._route = new Route()
    this._group = new Group()
  }

  getGeometry(): GeolocusGeometry {
    return this._geometry
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Point' | 'BBox' | 'LineString' | 'Polygon' {
    return this._type
  }

  clone(): GeoObject {
    const objectCloned = new GeoObject(this._geometry.clone())
    objectCloned._group = this._group
    objectCloned._route = this._route
    return objectCloned
  }
}
