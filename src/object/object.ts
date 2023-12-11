import crypto from 'crypto'
import { Feature, LineString, MultiPolygon, Point, Polygon } from 'geojson'
import { GeolocusContext } from '../context'
import { Direction, Topology } from '../relation'
import { GeolocusBBox, GeolocusGird, GeolocusObject, Position2 } from '../type'
import { Gird, Vector2 } from '../util'
import { GeoJSON } from './geoJSON'
import { IGeolocusObject, IGeolocusObjectOption } from './object.type'

export const getGeolocusObjectMaskWithinBBox = (
  object: GeolocusObject,
  girdNum: number,
): GeolocusGird => {
  const bbox = object.getBBox()
  const xStart = bbox[0]
  const xEnd = bbox[2]
  const dx = xEnd - xStart
  const yStart = bbox[1]
  const yEnd = bbox[3]
  const dy = yEnd - yStart
  const ratio = dy / dx
  const girdSize = dx / Math.sqrt(girdNum / ratio)

  const mask = Gird.getGirdWithFilter(
    Math.ceil(dy / girdSize),
    Math.ceil(dx / girdSize),
    (row, col) => {
      const tempPoint = new GeolocusPointObject([
        xStart + col * girdSize,
        yStart + row * girdSize,
      ])
      if (Topology.isIntersect(tempPoint, object)) {
        return 1
      } else {
        return 0
      }
    },
  )

  return mask
}

export class GeolocusPointObject implements IGeolocusObject {
  private _type: 'Point'
  private _context: GeolocusContext | null
  private _fuzzy: boolean
  private _name: string
  private _uuid: string
  private _geoJSON: Feature<Point>
  private _vertex: Position2
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    this._type = 'Point'
    this._context = context || null
    this._fuzzy = option?.fuzzy || false
    this._name = option?.name || ''
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.point(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]
    this._context && this._context.addObject(this._uuid, this)
  }

  getContext() {
    return this._context
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  setFuzzy(value: boolean) {
    this._fuzzy = value
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
      this._context,
      {
        fuzzy: this._fuzzy,
        name: this._name,
      },
    )
  }

  translate(origin: Position2, target: Position2) {
    const distance = Vector2.distanceTo(origin, target)
    const direction = Direction.azimuth(Vector2.sub(target, origin))
    this._geoJSON = GeoJSON.translate(this._geoJSON, distance, direction)
    this._vertex = this._geoJSON.geometry.coordinates as Position2
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]
  }

  static fromGeoJSON(
    geojson: Feature<Point>,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Point') {
      return new GeolocusPointObject(
        geojson.geometry.coordinates as Position2,
        context,
        {
          fuzzy: option?.fuzzy,
          name: option?.name,
        },
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _type: 'LineString'
  private _context: GeolocusContext | null
  private _fuzzy: boolean
  private _name: string
  private _uuid: string

  private _geoJSON: Feature<LineString>
  private _vertex: Position2[]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[],
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    this._type = 'LineString'
    this._context = context || null
    this._fuzzy = option?.fuzzy || false
    this._name = option?.name || ''
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.lineString(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    this._context && this._context.addObject(this._uuid, this)
  }

  getContext() {
    return this._context
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  setFuzzy(value: boolean) {
    this._fuzzy = value
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
      this._context,
      {
        fuzzy: this._fuzzy,
        name: this._name,
      },
    )
  }

  translate(origin: Position2, target: Position2) {
    const distance = Vector2.distanceTo(origin, target)
    const direction = Direction.azimuth(Vector2.sub(target, origin))
    this._geoJSON = GeoJSON.translate(this._geoJSON, distance, direction)
    this._vertex = this._geoJSON.geometry.coordinates as Position2[]
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]
  }

  static fromGeoJSON(
    geojson: Feature<LineString>,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'LineString') {
      return new GeolocusLineStringObject(
        geojson.geometry.coordinates as Position2[],
        context,
        {
          fuzzy: option?.fuzzy,
          name: option?.name,
        },
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _type: 'Polygon'
  private _context: GeolocusContext | null
  private _fuzzy: boolean
  private _name: string
  private _uuid: string
  private _geoJSON: Feature<Polygon>
  private _vertex: Position2[][]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[][],
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    this._type = 'Polygon'
    this._context = context || null
    this._fuzzy = option?.fuzzy || false
    this._name = option?.name || ''
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.polygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    this._context && this._context.addObject(this._uuid, this)
  }

  getContext() {
    return this._context
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  setFuzzy(value: boolean) {
    this._fuzzy = value
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

  getMaskWithinBBox(girdNum: number): GeolocusGird {
    return getGeolocusObjectMaskWithinBBox(this, girdNum)
  }

  clone(): GeolocusPolygonObject {
    return new GeolocusPolygonObject(
      this._geoJSON.geometry.coordinates.slice() as Position2[][],
      this._context,
      {
        fuzzy: this._fuzzy,
        name: this._name,
      },
    )
  }

  translate(origin: Position2, target: Position2) {
    const distance = Vector2.distanceTo(origin, target)
    const direction = Direction.azimuth(Vector2.sub(target, origin))
    this._geoJSON = GeoJSON.translate(this._geoJSON, distance, direction)
    this._vertex = this._geoJSON.geometry.coordinates as Position2[][]
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]
  }

  static fromBBox(
    position: GeolocusBBox,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ): GeolocusPolygonObject {
    const leftDown: Position2 = [position[0], position[1]]
    const rightDown: Position2 = [position[2], position[1]]
    const rightUp: Position2 = [position[2], position[3]]
    const leftUp: Position2 = [position[0], position[3]]

    return new GeolocusPolygonObject(
      [[leftDown, rightDown, rightUp, leftUp, leftDown]],
      context,
      {
        fuzzy: option?.fuzzy,
        name: option?.name,
      },
    )
  }

  static fromGeoJSON(
    geojson: Feature<Polygon>,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Polygon') {
      return new GeolocusPolygonObject(
        geojson.geometry.coordinates as Position2[][],
        context,
        {
          fuzzy: option?.fuzzy,
          name: option?.name,
        },
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}

export class GeolocusMultiPolygonObject implements IGeolocusObject {
  private _type: 'MultiPolygon'
  private _context: GeolocusContext | null
  private _fuzzy: boolean
  private _name: string
  private _uuid: string
  private _geoJSON: Feature<MultiPolygon>
  private _vertex: Position2[][][]
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[][][],
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    this._type = 'MultiPolygon'
    this._context = context || null
    this._fuzzy = option?.fuzzy || false
    this._name = option?.name || ''
    this._uuid = crypto.randomUUID()
    this._geoJSON = GeoJSON.multiPolygon(position)
    this._vertex = position
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = GeoJSON.centerOfMass(this._geoJSON)
    this._context && this._context.addObject(this._uuid, this)
  }

  getContext() {
    return this._context
  }

  getFuzzy(): boolean {
    return this._fuzzy
  }

  setFuzzy(value: boolean) {
    this._fuzzy = value
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

  getMaskWithinBBox(girdNum: number): GeolocusGird {
    return getGeolocusObjectMaskWithinBBox(this, girdNum)
  }

  clone(): GeolocusMultiPolygonObject {
    return new GeolocusMultiPolygonObject(
      this._geoJSON.geometry.coordinates.slice() as Position2[][][],
      this._context,
      {
        fuzzy: this._fuzzy,
        name: this._name,
      },
    )
  }

  translate(origin: Position2, target: Position2) {
    const distance = Vector2.distanceTo(origin, target)
    const direction = Direction.azimuth(Vector2.sub(target, origin))
    this._geoJSON = GeoJSON.translate(this._geoJSON, distance, direction)
    this._vertex = this._geoJSON.geometry.coordinates as Position2[][][]
    this._bbox = GeoJSON.bbox(this._geoJSON)
    this._center = [
      (this._bbox[0] + this._bbox[2]) / 2,
      (this._bbox[1] + this._bbox[3]) / 2,
    ]
  }

  static fromBBox(
    position: GeolocusBBox,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ): GeolocusMultiPolygonObject {
    const leftDown: Position2 = [position[0], position[1]]
    const rightDown: Position2 = [position[2], position[1]]
    const rightUp: Position2 = [position[2], position[3]]
    const leftUp: Position2 = [position[0], position[3]]

    return new GeolocusMultiPolygonObject(
      [[[leftDown, rightDown, rightUp, leftUp, leftDown]]],
      context,
      {
        fuzzy: option?.fuzzy,
        name: option?.name,
      },
    )
  }

  static fromGeoJSON(
    geojson: Feature<Polygon | MultiPolygon>,
    context: GeolocusContext | null = null,
    option?: IGeolocusObjectOption,
  ) {
    const geometryType = geojson.geometry.type
    if (geometryType === 'Polygon') {
      return new GeolocusMultiPolygonObject(
        [geojson.geometry.coordinates] as Position2[][][],
        context,
        {
          fuzzy: option?.fuzzy,
          name: option?.name,
        },
      )
    } else if (geometryType === 'MultiPolygon') {
      return new GeolocusMultiPolygonObject(
        geojson.geometry.coordinates as Position2[][][],
        context,
        {
          fuzzy: option?.fuzzy,
          name: option?.name,
        },
      )
    } else {
      throw Error(`${geometryType} is invalid geometry type`)
    }
  }
}
