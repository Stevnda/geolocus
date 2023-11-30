import crypto from 'crypto'
import { Feature, LineString, MultiPolygon, Point, Polygon } from 'geojson'
import { GeolocusContext } from '../context'
import { GeolocusBBox, Position2 } from '../type'
import { GeoJSON } from './geoJSON'
import { IGeolocusObject } from './type'

export class GeolocusPointObject implements IGeolocusObject {
  private _type: 'Point'
  private _fuzzy: boolean
  private _name: string
  private _uuid: string
  private _geoJSON: Feature<Point>
  private _vertex: Position2
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2, fuzzy = false, name = '') {
    this._type = 'Point'
    this._fuzzy = fuzzy
    this._name = name
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.point(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]

    GeolocusContext.addObject(this._uuid, this)
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  getName(): string {
    return this._name
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

  getCenter(): Position2 {
    return this._center
  }

  getGeoJSON(): Feature<Point> {
    return this._geoJSON
  }

  clone(): GeolocusPointObject {
    return new GeolocusPointObject(
      this._geoJSON.geometry.coordinates.slice() as Position2,
      this._fuzzy,
      this._name,
    )
  }

  static fromGeoJSON(geojson: Feature<Point>, fuzzy = false, name = '') {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Point') {
      return new GeolocusPointObject(
        geojson.geometry.coordinates as Position2,
        fuzzy,
        name,
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _type: 'LineString'
  private _fuzzy: boolean
  private _name: string
  private _uuid: string

  private _geoJSON: Feature<LineString>
  private _vertex: Position2[]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2[], fuzzy = false, name = '') {
    this._type = 'LineString'
    this._fuzzy = fuzzy
    this._name = name
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.lineString(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    GeolocusContext.addObject(this._uuid, this)
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  getName(): string {
    return this._name
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

  getCenter(): Position2 {
    return this._center
  }

  getGeoJSON(): Feature<LineString> {
    return this._geoJSON
  }

  clone(): GeolocusLineStringObject {
    return new GeolocusLineStringObject(
      this._geoJSON.geometry.coordinates.slice() as Position2[],
      this._fuzzy,
      this._name,
    )
  }

  static fromGeoJSON(geojson: Feature<LineString>, fuzzy = false, name = '') {
    const geometryType = geojson.geometry.type
    if (geometryType === 'LineString') {
      return new GeolocusLineStringObject(
        geojson.geometry.coordinates as Position2[],
        fuzzy,
        name,
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _type: 'Polygon'
  private _fuzzy: boolean
  private _name: string
  private _uuid: string
  private _geoJSON: Feature<Polygon>
  private _vertex: Position2[][]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2[][], fuzzy = false, name = '') {
    this._type = 'Polygon'
    this._fuzzy = fuzzy
    this._name = name
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.polygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    GeolocusContext.addObject(this._uuid, this)
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  getName(): string {
    return this._name
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

  getCenter(): Position2 {
    return this._center
  }

  getGeoJSON(): Feature<Polygon> {
    return this._geoJSON
  }

  clone(): GeolocusPolygonObject {
    return new GeolocusPolygonObject(
      this._geoJSON.geometry.coordinates.slice() as Position2[][],
      this._fuzzy,
      this._name,
    )
  }

  static fromBBox(
    position: GeolocusBBox,
    fuzzy = false,
    name = '',
  ): GeolocusPolygonObject {
    const leftDown: Position2 = [position[0], position[1]]
    const rightDown: Position2 = [position[2], position[1]]
    const rightUp: Position2 = [position[2], position[3]]
    const leftUp: Position2 = [position[0], position[3]]

    return new GeolocusPolygonObject(
      [[leftDown, rightDown, rightUp, leftUp, leftDown]],
      fuzzy,
      name,
    )
  }

  static fromGeoJSON(geojson: Feature<Polygon>, fuzzy = false, name = '') {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Polygon') {
      return new GeolocusPolygonObject(
        geojson.geometry.coordinates as Position2[][],
        fuzzy,
        name,
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusMultiPolygonObject implements IGeolocusObject {
  private _type: 'MultiPolygon'
  private _fuzzy: boolean
  private _name: string
  private _uuid: string
  private _geoJSON: Feature<MultiPolygon>
  private _vertex: Position2[][][]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2[][][], fuzzy = false, name = '') {
    this._type = 'MultiPolygon'
    this._fuzzy = fuzzy
    this._name = name
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.multiPolygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    GeolocusContext.addObject(this._uuid, this)
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  getName(): string {
    return this._name
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiPolygon' {
    return this._type
  }

  getVertex(): Position2[][][] {
    return this._vertex
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }

  getGeoJSON(): Feature<MultiPolygon> {
    return this._geoJSON
  }

  clone(): GeolocusMultiPolygonObject {
    return new GeolocusMultiPolygonObject(
      this._geoJSON.geometry.coordinates.slice() as Position2[][][],
      this._fuzzy,
      this._name,
    )
  }

  static fromBBox(
    position: GeolocusBBox,
    fuzzy = false,
    name = '',
  ): GeolocusMultiPolygonObject {
    const leftDown: Position2 = [position[0], position[1]]
    const rightDown: Position2 = [position[2], position[1]]
    const rightUp: Position2 = [position[2], position[3]]
    const leftUp: Position2 = [position[0], position[3]]

    return new GeolocusMultiPolygonObject(
      [[[leftDown, rightDown, rightUp, leftUp, leftDown]]],
      fuzzy,
      name,
    )
  }

  static fromGeoJSON(
    geojson: Feature<Polygon | MultiPolygon>,
    fuzzy = false,
    name = '',
  ) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Polygon') {
      return new GeolocusMultiPolygonObject([
        geojson.geometry.coordinates,
        fuzzy,
        name,
      ] as Position2[][][])
    } else if (geometryType === 'MultiPolygon') {
      return new GeolocusMultiPolygonObject(
        geojson.geometry.coordinates as Position2[][][],
        fuzzy,
        name,
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}
