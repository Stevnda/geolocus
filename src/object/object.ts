import crypto from 'crypto'
import { Position2 } from '../type'
import {
  GeolocusBBox,
  GeolocusGeometry,
  GeolocusLineStringGeometry,
  GeolocusPointGeometry,
  GeolocusPolygonGeometry,
  Geometry,
} from './geometry'

interface IGeolocusObject {
  getUUID(): string
  getType(): 'Point' | 'LineString' | 'Polygon'
  getVertex(): Position2[] | Position2
  getBBox(): GeolocusBBox
  getGeometry(): GeolocusGeometry
}

export type GeolocusObject =
  | GeolocusPointObject
  | GeolocusLineStringObject
  | GeolocusPolygonObject

export class GeolocusPointObject implements IGeolocusObject {
  private _type: 'Point'
  private _uuid: string
  // private _route: Route
  // private _group: Group
  private _geometry: GeolocusPointGeometry
  private _vertex: Position2
  private _bbox: GeolocusBBox

  constructor(position: Position2) {
    this._type = 'Point'
    this._uuid = crypto.randomUUID()
    // this._route = new Route()
    // this._group = new Group()
    this._geometry = Geometry.point(position)
    this._vertex = position
    this._bbox = Geometry.bbox(this._geometry)
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Point' {
    return this._type
  }

  getVertex(): Position2 {
    return this._vertex
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getGeometry(): GeolocusPointGeometry {
    return this._geometry
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _type: 'LineString'
  private _uuid: string
  // private _route: Route
  // private _group: Group
  private _geometry: GeolocusLineStringGeometry
  private _vertex: Position2[]
  private _bbox: GeolocusBBox

  constructor(position: Position2[]) {
    this._type = 'LineString'
    this._uuid = crypto.randomUUID()
    // this._route = new Route()
    // this._group = new Group()
    this._geometry = Geometry.lineString(position)
    this._vertex = position
    this._bbox = Geometry.bbox(this._geometry)
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'LineString' {
    return this._type
  }

  getVertex(): Position2[] {
    return this._vertex
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getGeometry(): GeolocusLineStringGeometry {
    return this._geometry
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _type: 'Polygon'
  private _uuid: string
  // private _route: Route
  // private _group: Group
  private _geometry: GeolocusPolygonGeometry
  private _vertex: Position2[]
  private _bbox: GeolocusBBox

  constructor(position: Position2[]) {
    this._type = 'Polygon'
    this._uuid = crypto.randomUUID()
    // this._route = new Route()
    // this._group = new Group()
    this._geometry = Geometry.polygon(position)
    this._vertex = position
    this._bbox = Geometry.bbox(this._geometry)
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Polygon' {
    return this._type
  }

  getVertex(): Position2[] {
    return this._vertex
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getGeometry(): GeolocusPolygonGeometry {
    return this._geometry
  }
}
