import { randomUUID } from 'crypto'
import { GeolocusGeometry } from './geometry.datum'
import { GeolocusObjectInfo } from './objectInfo.datum'

interface GeolocusObjectProps {
  setUUID(value: string): void
  getUUID(): string
  setInfo(value: GeolocusObjectInfo): void
  getInfo(): GeolocusObjectInfo
  setGeometry(
    type: 'point' | 'lineString' | 'polygon',
    geometry: GeolocusGeometry,
  ): void
  getGeometry(type: 'point' | 'lineString' | 'polygon'): GeolocusGeometry | null
}

export class GeolocusObject implements GeolocusObjectProps {
  _uuid: string
  _info: GeolocusObjectInfo
  _geometryMap: Record<
    'point' | 'lineString' | 'polygon',
    GeolocusGeometry | null
  >

  constructor(
    info: GeolocusObjectInfo,
    geometryMap: Record<
      'point' | 'lineString' | 'polygon',
      GeolocusGeometry | null
    >,
  ) {
    this._uuid = randomUUID()
    this._info = info
    this._geometryMap = geometryMap
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  setInfo(value: GeolocusObjectInfo): void {
    this._info = value
  }

  getInfo(): GeolocusObjectInfo {
    return this._info
  }

  setGeometry(
    type: 'point' | 'lineString' | 'polygon',
    geometry: GeolocusGeometry,
  ): void {
    this._geometryMap[type] = geometry
  }

  getGeometry(
    type: 'point' | 'lineString' | 'polygon',
  ): GeolocusGeometry | null {
    return this._geometryMap[type]
  }
}
