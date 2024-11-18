import { GeolocusGeometry, GeolocusGeometryType, GeolocusObject, JTSGeometryFactory, Position2 } from '@/object'
import { GeolocusContext } from './context'
import { PlaceOutput, PlacePlugin } from './objectMap.type'

const defaultPlacePlugin = (name: string, nameMap: Map<string, GeolocusObject>): PlaceOutput | null => {
  const res = nameMap.get(name)
  return res != null
    ? {
        object: res,
      }
    : null
}

export class ObjectMap {
  private _context: GeolocusContext
  private _placePluginList: PlacePlugin[]
  private _uuidMap: Map<string, GeolocusObject>
  private _nameMap: Map<string, GeolocusObject>
  private _typeMap: Map<string, Set<GeolocusObject>>

  constructor(context: GeolocusContext) {
    this._context = context
    this._placePluginList = [(name: string) => defaultPlacePlugin(name, this._nameMap)]
    this._uuidMap = new Map() // objectUUID - geolocusObject
    this._nameMap = new Map() // objectName - geolocusObject
    this._typeMap = new Map() // objectType - geolocusObject
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }

  getContext(): GeolocusContext {
    return this._context
  }

  setPlacePluginList(value: PlacePlugin[]): void {
    this._placePluginList = value
  }

  getPlacePluginList(): PlacePlugin[] {
    return this._placePluginList
  }

  setUuidMap(value: Map<string, GeolocusObject>): void {
    this._uuidMap = value
  }

  getUuidMap(): Map<string, GeolocusObject> {
    return this._uuidMap
  }

  setNameMap(value: Map<string, GeolocusObject>): void {
    this._nameMap = value
  }

  getNameMap(): Map<string, GeolocusObject> {
    return this._nameMap
  }

  setTypeMap(value: Map<string, Set<GeolocusObject>>): void {
    this._typeMap = value
  }

  getTypeMap(): Map<string, Set<GeolocusObject>> {
    return this._typeMap
  }
}

export class ObjectMapAction {
  static addObject(objectMap: ObjectMap, object: GeolocusObject): void {
    const uuidMap = objectMap.getUuidMap()
    const nameMap = objectMap.getNameMap()
    const typeMap = objectMap.getTypeMap()

    uuidMap.set(object.getUUID(), object)

    const name = object.getName()
    if (name) {
      nameMap.set(name, object)
    }

    const type = object.getType()
    if (type) {
      if (typeMap.has(type)) {
        typeMap.get(type)?.add(object)
      } else {
        typeMap.set(type, new Set([object]))
      }
    }
  }

  static getObjectByUUID(objectMap: ObjectMap, uuid: string): GeolocusObject | null {
    const map = objectMap.getUuidMap()
    return map.get(uuid) || null
  }

  static getObjectByPlaceName(objectMap: ObjectMap, name: string): GeolocusObject | null {
    const pluginList = objectMap.getPlacePluginList()
    for (const plugin of pluginList) {
      const res = plugin(name)
      if (res == null) continue
      if (res.object != null) {
        return res.object
      } else {
        const coord = <Position2 | Position2[] | Position2[][] | Position2[][][]>res.coord
        const type = <GeolocusGeometryType>res.type
        return new GeolocusObject(
          new GeolocusGeometry(type, JTSGeometryFactory.create(type, coord)),
          name,
          null,
          'precise',
        )
      }
    }
    return null
  }

  static getObjectListByType(objectMap: ObjectMap, type: string): GeolocusObject[] {
    const map = objectMap.getTypeMap()
    const res = map.get(type)
    return res != null ? [...res] : []
  }

  static deleteObject(objectMap: ObjectMap, object: GeolocusObject): void {
    const uuidMap = objectMap.getUuidMap()
    const nameMap = objectMap.getNameMap()
    const typeMap = objectMap.getTypeMap()

    uuidMap.delete(object.getUUID())

    const name = object.getName()
    if (name) {
      nameMap.delete(name)
    }

    const type = object.getType()
    if (type) {
      typeMap.get(type)?.delete(object)
    }
  }
}
