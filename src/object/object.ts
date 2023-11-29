import crypto from 'crypto'
import { Feature, LineString, MultiPolygon, Point, Polygon } from 'geojson'
import { GeolocusContext } from '../context'
import { GeolocusBBox, Position2 } from '../type'
import { GeoJSON } from './geoJSON'
import { IGeolocusObject } from './type'

export class GeolocusPointObject implements IGeolocusObject {
  private _type: 'Point'
  private _uuid: string
  private _geoJSON: Feature<Point>
  private _vertex: Position2
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2) {
    this._type = 'Point'
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.point(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]
    GeolocusContext.OBJECT.set(this._uuid, this)
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
    )
  }

  static fromGeoJSON(geojson: Feature<Point>) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Point') {
      return new GeolocusPointObject(geojson.geometry.coordinates as Position2)
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _type: 'LineString'
  private _uuid: string

  private _geoJSON: Feature<LineString>
  private _vertex: Position2[]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2[]) {
    this._type = 'LineString'
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.lineString(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    GeolocusContext.OBJECT.set(this._uuid, this)
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
    )
  }

  static fromGeoJSON(geojson: Feature<LineString>) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'LineString') {
      return new GeolocusLineStringObject(
        geojson.geometry.coordinates as Position2[],
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _type: 'Polygon'
  private _uuid: string
  private _geoJSON: Feature<Polygon>
  private _vertex: Position2[][]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2[][]) {
    this._type = 'Polygon'
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.polygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    GeolocusContext.OBJECT.set(this._uuid, this)
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
    )
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

  static fromGeoJSON(geojson: Feature<Polygon>) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Polygon') {
      return new GeolocusPolygonObject(
        geojson.geometry.coordinates as Position2[][],
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusMultiPolygonObject implements IGeolocusObject {
  private _type: 'MultiPolygon'
  private _uuid: string
  private _geoJSON: Feature<MultiPolygon>
  private _vertex: Position2[][][]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(position: Position2[][][]) {
    this._type = 'MultiPolygon'
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.multiPolygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    GeolocusContext.OBJECT.set(this._uuid, this)
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
    )
  }

  static fromBBox(position: GeolocusBBox): GeolocusMultiPolygonObject {
    const leftDown: Position2 = [position[0], position[1]]
    const rightDown: Position2 = [position[2], position[1]]
    const rightUp: Position2 = [position[2], position[3]]
    const leftUp: Position2 = [position[0], position[3]]

    return new GeolocusMultiPolygonObject([
      [[leftDown, rightDown, rightUp, leftUp, leftDown]],
    ])
  }

  static fromGeoJSON(geojson: Feature<Polygon | MultiPolygon>) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Polygon') {
      return new GeolocusMultiPolygonObject([
        geojson.geometry.coordinates,
      ] as Position2[][][])
    } else if (geometryType === 'MultiPolygon') {
      return new GeolocusMultiPolygonObject(
        geojson.geometry.coordinates as Position2[][][],
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}
