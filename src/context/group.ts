import crypto from 'crypto'

export class Group {
  private _groupUUID: string
  private _geoObject: object[]

  constructor() {
    this._groupUUID = crypto.randomUUID()
    this._geoObject = []
  }

  setGroupUUID(value: string) {
    this._groupUUID = value
  }

  getGroupUUID() {
    return this._groupUUID
  }

  setGeoObject(value: object[]) {
    this._geoObject = value
  }

  getGeoObject() {
    return this._geoObject
  }
}
