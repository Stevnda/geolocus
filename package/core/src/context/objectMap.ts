import { GeolocusGeometry, GeolocusGeometryType, GeolocusObject, JTSGeometryFactory, Position2 } from '@/object'
import { GeolocusContext } from './context'
import { PlaceOutput, PlacePlugin } from './objectMap.type'

// NOTE 命名最大概率匹配算法
const defaultPlacePlugin = (name: string, nameMap: Map<string, Set<GeolocusObject>>): PlaceOutput | null => {
  const res = nameMap.get(name)
  if (res == null) {
    return null
  }

  const [object] = res
  return {
    object,
  }
}

export class ObjectMap {
  private _context: GeolocusContext
  private _placePluginList: PlacePlugin[]
  private _uuidMap: Map<string, GeolocusObject>
  private _nameMap: Map<string, Set<GeolocusObject>>

  constructor(context: GeolocusContext) {
    this._context = context
    this._placePluginList = [(name: string) => defaultPlacePlugin(name, this._nameMap)]
    this._uuidMap = new Map() // objectUUID - geolocusObject
    this._nameMap = new Map() // objectName - geolocusObject
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

  getUUIDMap(): Map<string, GeolocusObject> {
    return this._uuidMap
  }

  setNameMap(value: Map<string, Set<GeolocusObject>>): void {
    this._nameMap = value
  }

  getNameMap(): Map<string, Set<GeolocusObject>> {
    return this._nameMap
  }
}

export class ObjectMapAction {
  static addObject(objectMap: ObjectMap, object: GeolocusObject): void {
    const uuidMap = objectMap.getUUIDMap()
    const nameMap = objectMap.getNameMap()

    uuidMap.set(object.getUUID(), object)

    const name = object.getName()
    if (name) {
      if (nameMap.has(name)) {
        nameMap.get(name)?.add(object)
      } else {
        nameMap.set(name, new Set([object]))
      }
    }
  }

  static getObjectByUUID(objectMap: ObjectMap, uuid: string): GeolocusObject | null {
    const map = objectMap.getUUIDMap()
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
        return new GeolocusObject(new GeolocusGeometry(type, JTSGeometryFactory.create(type, coord)), { name })
      }
    }
    return null
  }

  static deleteObject(objectMap: ObjectMap, object: GeolocusObject): void {
    const uuidMap = objectMap.getUUIDMap()
    const nameMap = objectMap.getNameMap()

    uuidMap.delete(object.getUUID())

    const name = object.getName()
    if (name) {
      nameMap.get(name)?.delete(object)
    }
  }
}
