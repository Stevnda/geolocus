import { randomUUID } from 'crypto'
import { GeolocusGeometry } from './geometry.actor'

interface GeolocusObjectProps {
  setUUID(value: string): void
  getUUID(): string
  setStatus(value: 'fuzzy' | 'precise'): void
  getStatus(): 'fuzzy' | 'precise'
  setName(value: string | null): void
  getName(): string | null
  setGeometry(geometry: GeolocusGeometry): void
  getGeometry(): GeolocusGeometry
}

export class GeolocusObject implements GeolocusObjectProps {
  private _uuid: string
  private _status: 'fuzzy' | 'precise'
  private _name: string | null
  private _geometry: GeolocusGeometry

  constructor(
    geometry: GeolocusGeometry,
    name: string | null = null,
    type: 'fuzzy' | 'precise' = 'precise',
  ) {
    this._uuid = randomUUID()
    this._status = type
    this._name = name
    this._geometry = geometry
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  setStatus(value: 'fuzzy' | 'precise'): void {
    this._status = value
  }

  getStatus(): 'fuzzy' | 'precise' {
    return this._status
  }

  setName(value: string | null): void {
    this._name = value
  }

  getName(): string | null {
    return this._name
  }

  setGeometry(geometry: GeolocusGeometry): void {
    this._geometry = geometry
  }

  getGeometry(): GeolocusGeometry {
    return this._geometry
  }
}
