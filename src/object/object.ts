import crypto from 'crypto'
import { GeolocusBBox, Position2 } from '../type'
import {
  GeolocusGeoJSON,
  GeoJSONLineString,
  GeoJSONPoint,
  GeoJSONPolygon,
  GeoJSON,
} from './geoJSON'

interface IGeolocusObject {
  getUUID(): string
  getType(): 'Point' | 'LineString' | 'Polygon'
  getVertex(): Position2 | Position2[] | Position2[][]
  getBBox(): GeolocusBBox
  getGeoJSON(): GeolocusGeoJSON
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
  private _geoJSON: GeoJSONPoint
  private _vertex: Position2
  private _bbox: GeolocusBBox

  constructor(position: Position2) {
    this._type = 'Point'
    this._uuid = crypto.randomUUID()
    // this._route = new Route()
    // this._group = new Group()
    this._geoJSON = GeoJSON.point(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
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

  getGeoJSON(): GeoJSONPoint {
    return this._geoJSON
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _type: 'LineString'
  private _uuid: string
  // private _route: Route
  // private _group: Group
  private _geoJSON: GeoJSONLineString
  private _vertex: Position2[]
  private _bbox: GeolocusBBox

  constructor(position: Position2[]) {
    this._type = 'LineString'
    this._uuid = crypto.randomUUID()
    // this._route = new Route()
    // this._group = new Group()
    this._geoJSON = GeoJSON.lineString(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
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

  getGeoJSON(): GeoJSONLineString {
    return this._geoJSON
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _type: 'Polygon'
  private _uuid: string
  // private _route: Route
  // private _group: Group
  private _geoJSON: GeoJSONPolygon
  private _vertex: Position2[][]
  private _bbox: GeolocusBBox

  constructor(position: Position2[][]) {
    this._type = 'Polygon'
    this._uuid = crypto.randomUUID()
    // this._route = new Route()
    // this._group = new Group()
    this._geoJSON = GeoJSON.polygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Polygon' {
    return this._type
  }

  getVertex(): Position2[][] {
    return this._vertex
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getGeoJSON(): GeoJSONPolygon {
    return this._geoJSON
  }

  static fromBBox(position: GeolocusBBox): GeolocusPolygonObject {
    const leftDown: Position2 = [position[0], position[1]]
    const rightDown: Position2 = [position[2], position[1]]
    const rightUp: Position2 = [position[2], position[3]]
    const leftUp: Position2 = [position[0], position[3]]

    return new GeolocusPolygonObject([
      [leftDown, rightDown, rightUp, leftUp, leftDown],
    ])
  }
}
