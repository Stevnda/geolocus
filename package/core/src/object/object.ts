import { TGeolocusContext, TPosition2 } from '@/context'
import crypto from 'crypto'
import { GeolocusGeometryFactory, GeolocusGeometryMeta } from './geometry'
import {
  IGeolocusObject,
  IGeolocusObjectInit,
  TGeolocusBBox,
  TGeolocusGeometry,
  TGeolocusLineStringGeometry,
  TGeolocusMultiLineStringGeometry,
  TGeolocusMultiPointGeometry,
  TGeolocusMultiPolygonGeometry,
  TGeolocusObjectStatus,
  TGeolocusPointGeometry,
  TGeolocusPolygonGeometry,
} from './object.type'

export class GeolocusPointObject implements IGeolocusObject {
  private _context: TGeolocusContext | null
  private _uuid: string
  private _type: 'Point'
  private _status: TGeolocusObjectStatus
  private _name: string
  private _geometry: TGeolocusGeometry
  private _bbox: TGeolocusBBox
  private _center: TPosition2

  constructor(position: TPosition2, option: IGeolocusObjectInit | null = null) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = 'Point'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry = option?.geometry || GeolocusGeometryFactory.point(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.getObjectMap().set(this._uuid, this)
  }

  getContext(): TGeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Point' {
    return this._type
  }

  getStatus(): TGeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): TGeolocusPointGeometry {
    return this._geometry as TGeolocusPointGeometry
  }

  getBBox(): TGeolocusBBox {
    return this._bbox
  }

  getCenter(): TPosition2 {
    return this._center
  }
}

export class GeolocusLineStringObject implements IGeolocusObject {
  private _context: TGeolocusContext | null
  private _uuid: string
  private _type: 'LineString'
  private _status: TGeolocusObjectStatus
  private _name: string
  private _geometry: TGeolocusGeometry
  private _bbox: TGeolocusBBox
  private _center: TPosition2

  constructor(
    position: TPosition2[],
    option: IGeolocusObjectInit | null = null,
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = 'LineString'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.lineString(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.getObjectMap().set(this._uuid, this)
  }

  getContext(): TGeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'LineString' {
    return this._type
  }

  getStatus(): TGeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): TGeolocusLineStringGeometry {
    return this._geometry as TGeolocusLineStringGeometry
  }

  getBBox(): TGeolocusBBox {
    return this._bbox
  }

  getCenter(): TPosition2 {
    return this._center
  }
}

export class GeolocusPolygonObject implements IGeolocusObject {
  private _context: TGeolocusContext | null
  private _uuid: string
  private _type: 'Polygon'
  private _status: TGeolocusObjectStatus
  private _name: string
  private _geometry: TGeolocusGeometry
  private _bbox: TGeolocusBBox
  private _center: TPosition2

  constructor(
    position: TPosition2[][],
    option: IGeolocusObjectInit | null = null,
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = 'Polygon'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.polygon(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.getObjectMap().set(this._uuid, this)
  }

  getContext(): TGeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Polygon' {
    return this._type
  }

  getStatus(): TGeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): TGeolocusPolygonGeometry {
    return this._geometry as TGeolocusPolygonGeometry
  }

  getBBox(): TGeolocusBBox {
    return this._bbox
  }

  getCenter(): TPosition2 {
    return this._center
  }
}

export class GeolocusMultiPointObject implements IGeolocusObject {
  private _context: TGeolocusContext | null
  private _uuid: string
  private _type: 'MultiPoint'
  private _status: TGeolocusObjectStatus
  private _name: string
  private _geometry: TGeolocusGeometry
  private _bbox: TGeolocusBBox
  private _center: TPosition2

  constructor(
    position: TPosition2[],
    option: IGeolocusObjectInit | null = null,
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = 'MultiPoint'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.multiPoint(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.getObjectMap().set(this._uuid, this)
  }

  getContext(): TGeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiPoint' {
    return this._type
  }

  getStatus(): TGeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): TGeolocusMultiPointGeometry {
    return this._geometry as TGeolocusMultiPointGeometry
  }

  getBBox(): TGeolocusBBox {
    return this._bbox
  }

  getCenter(): TPosition2 {
    return this._center
  }
}

export class GeolocusMultiLineStringObject implements IGeolocusObject {
  private _context: TGeolocusContext | null
  private _uuid: string
  private _type: 'MultiLineString'
  private _status: TGeolocusObjectStatus
  private _name: string
  private _geometry: TGeolocusGeometry
  private _bbox: TGeolocusBBox
  private _center: TPosition2

  constructor(
    position: TPosition2[][],
    option: IGeolocusObjectInit | null = null,
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = 'MultiLineString'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.multiLineString(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.getObjectMap().set(this._uuid, this)
  }

  getContext(): TGeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiLineString' {
    return this._type
  }

  getStatus(): TGeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): TGeolocusMultiLineStringGeometry {
    return this._geometry as TGeolocusMultiLineStringGeometry
  }

  getBBox(): TGeolocusBBox {
    return this._bbox
  }

  getCenter(): TPosition2 {
    return this._center
  }
}

export class GeolocusMultiPolygonObject implements IGeolocusObject {
  private _context: TGeolocusContext | null
  private _uuid: string
  private _type: 'MultiPolygon'
  private _status: TGeolocusObjectStatus
  private _name: string
  private _geometry: TGeolocusGeometry
  private _bbox: TGeolocusBBox
  private _center: TPosition2

  constructor(
    position: TPosition2[][][],
    option: IGeolocusObjectInit | null = null,
  ) {
    this._context = option?.context || null
    this._uuid = option?.uuid || crypto.randomUUID()
    this._type = 'MultiPolygon'
    this._status = option?.status || 'precise'
    this._name = option?.name || ''
    this._geometry =
      option?.geometry || GeolocusGeometryFactory.multiPolygon(position)
    this._bbox = option?.bbox || GeolocusGeometryMeta.getBBox(this._geometry)
    this._center =
      option?.center || GeolocusGeometryMeta.getCenter(this._geometry)

    this._context && this._context.getObjectMap().set(this._uuid, this)
  }

  getContext(): TGeolocusContext | null {
    return this._context
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'MultiPolygon' {
    return this._type
  }

  getStatus(): TGeolocusObjectStatus {
    return this._status
  }

  getName(): string {
    return this._name
  }

  getGeometry(): TGeolocusMultiPolygonGeometry {
    return this._geometry as TGeolocusMultiPolygonGeometry
  }

  getBBox(): TGeolocusBBox {
    return this._bbox
  }

  getCenter(): TPosition2 {
    return this._center
  }
}
