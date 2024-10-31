import { GeolocusObject } from '@/object'
import { GeolocusContext } from './context'

export class ObjectMap {
  private _context: GeolocusContext
  private _uuidMap: Map<string, GeolocusObject>
  private _nameMap: Map<string, GeolocusObject>
  private _typeMap: Map<string, Set<GeolocusObject>>

  constructor(context: GeolocusContext) {
    this._context = context
    this._uuidMap = new Map() // objectUUID - geolocusObject
    this._nameMap = new Map() // objectName - geolocusObject
    this._typeMap = new Map() // objectType - geolocusObject
  }

  getContext() {
    return this._context
  }

  addObject(object: GeolocusObject): void {
    this._uuidMap.set(object.getUUID(), object)

    const name = object.getName()
    if (name) {
      this._nameMap.set(name, object)
    }

    const type = object.getType()
    if (type) {
      if (this._typeMap.has(type)) {
        this._typeMap.get(type)?.add(object)
      } else {
        this._typeMap.set(type, new Set([object]))
      }
    }
  }

  getObjectUUIDMap() {
    return this._uuidMap
  }

  getObjectByUUID(uuid: string) {
    return this._uuidMap.get(uuid) || null
  }

  getObjectByPlaceName(name: string) {
    return this._nameMap.get(name) || null
  }

  getObjectListByType(type: string) {
    return this._typeMap.get(type) || new Set()
  }
}
