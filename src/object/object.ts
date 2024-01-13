import { GeolocusContext } from '@/context'
import { GeolocusBBox, Position2 } from '@/type'
import { GeolocusObjectStatus } from '@/type/object'
import crypto from 'crypto'
import { GeolocusGeometryFactory, GeolocusGeometryMeta } from './geometry'
import {
  GeolocusGeometry,
  GeolocusLineStringGeometry,
  GeolocusMultiLineStringGeometry,
  GeolocusMultiPointGeometry,
  GeolocusMultiPolygonGeometry,
  GeolocusPointGeometry,
  GeolocusPolygonGeometry,
  IGeolocusObject,
  IGeolocusObjectInit,
} from './type'

export class GeolocusPointObject implements IGeolocusObject {
  private _context: GeolocusContext | null
  private _uuid: string
  private _type: 'Point'
  private _status: GeolocusObjectStatus
  private _name: string
  private _geometry: GeolocusGeometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2,
    option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'Point' },
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = option?.type || 'Point'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry = option?.geometry || GeolocusGeometryFactory.point(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.addObject(this._uuid, this)
  }

  getContext(): GeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Point' {
    return this._type
  }

  getStatus(): GeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): GeolocusPointGeometry {
    return this._geometry as GeolocusPointGeometry
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _context: GeolocusContext | null
  private _uuid: string
  private _type: 'LineString'
  private _status: GeolocusObjectStatus
  private _name: string
  private _geometry: GeolocusGeometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[],
    option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'LineString' },
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = option?.type || 'LineString'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.lineString(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.addObject(this._uuid, this)
  }

  getContext(): GeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'LineString' {
    return this._type
  }

  getStatus(): GeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): GeolocusLineStringGeometry {
    return this._geometry as GeolocusLineStringGeometry
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _context: GeolocusContext | null
  private _uuid: string
  private _type: 'Polygon'
  private _status: GeolocusObjectStatus
  private _name: string
  private _geometry: GeolocusGeometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[][],
    option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'Polygon' },
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = option?.type || 'Polygon'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.polygon(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.addObject(this._uuid, this)
  }

  getContext(): GeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Polygon' {
    return this._type
  }

  getStatus(): GeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): GeolocusPolygonGeometry {
    return this._geometry as GeolocusPolygonGeometry
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }
}

export class GeolocusMultiPointObject implements IGeolocusObject {
  private _context: GeolocusContext | null
  private _uuid: string
  private _type: 'MultiPoint'
  private _status: GeolocusObjectStatus
  private _name: string
  private _geometry: GeolocusGeometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[],
    option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'MultiPoint' },
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = option?.type || 'MultiPoint'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.multiPoint(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.addObject(this._uuid, this)
  }

  getContext(): GeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiPoint' {
    return this._type
  }

  getStatus(): GeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): GeolocusMultiPointGeometry {
    return this._geometry as GeolocusMultiPointGeometry
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }
}

export class GeolocusMultiLineStringObject implements IGeolocusObject {
  private _context: GeolocusContext | null
  private _uuid: string
  private _type: 'MultiLineString'
  private _status: GeolocusObjectStatus
  private _name: string
  private _geometry: GeolocusGeometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[][],
    option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'MultiLineString' },
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = option?.type || 'MultiLineString'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.multiLineString(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.addObject(this._uuid, this)
  }

  getContext(): GeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiLineString' {
    return this._type
  }

  getStatus(): GeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): GeolocusMultiLineStringGeometry {
    return this._geometry as GeolocusMultiLineStringGeometry
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }
}

export class GeolocusMultiPolygonObject implements IGeolocusObject {
  private _context: GeolocusContext | null
  private _uuid: string
  private _type: 'MultiPolygon'
  private _status: GeolocusObjectStatus
  private _name: string
  private _geometry: GeolocusGeometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(
    position: Position2[][][],
    option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'MultiPolygon' },
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = option?.type || 'MultiPolygon'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.multiPolygon(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.addObject(this._uuid, this)
  }

  getContext(): GeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiPolygon' {
    return this._type
  }

  getStatus(): GeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): GeolocusMultiPolygonGeometry {
    return this._geometry as GeolocusMultiPolygonGeometry
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  getCenter(): Position2 {
    return this._center
  }
}
