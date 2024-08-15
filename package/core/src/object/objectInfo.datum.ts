interface GeolocusObjectInfoProps {
  setStatus(value: 'fuzzy' | 'precise'): void
  getStatus(): 'fuzzy' | 'precise'
  setName(value: string | null): void
  getName(): string | null
}

export class GeolocusObjectInfo implements GeolocusObjectInfoProps {
  _status: 'fuzzy' | 'precise'
  _name: string | null

  constructor(type: 'fuzzy' | 'precise', name?: string) {
    this._status = type
    this._name = name || null
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
}
