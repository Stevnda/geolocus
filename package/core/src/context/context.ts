/* eslint-disable @typescript-eslint/ban-types */
import { Route } from './route'
import { Role } from './role'
import { Relation } from '@/relation'
import { GeolocusPlugin, PlacePlugin } from './plugin'
import { GeolocusContextInit } from './context.type'
import { RegionResult } from '@/region'
import { ObjectMap } from './objectMap'
import { generateUUID } from '@/util'
import { GeolocusGeometry, GeolocusObject, JTSGeometryFactory } from '@/object'

export class GeolocusContext {
  // init
  private _uuid: string
  private _name: string
  private _regionRange: GeolocusObject
  private _pluginMap: Map<GeolocusPlugin, Function>
  private _roleMap: Map<string, Role>
  private _maxDistance: number
  private _gridSize: number

  // runtime
  private _objectMap: ObjectMap
  private _relation: Relation
  private _route: Route
  private _resultMap: Map<string, RegionResult>

  constructor(init: GeolocusContextInit) {
    this._uuid = generateUUID()
    this._name = init.name || 'default'
    this._regionRange = new GeolocusObject(new GeolocusGeometry('Polygon', JTSGeometryFactory.polygon([init.region])))
    this._objectMap = new ObjectMap(this)
    this._pluginMap = new Map()
    this._relation = new Relation(this)
    this._route = new Route(this)
    this._roleMap = new Map() // the key is the name of role
    this._resultMap = new Map() // the uuid of resultMap is the same as geolocusObject
    this._maxDistance = init.maxDistance
    this._gridSize = init.gridSize || 128
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  setName(value: string): void {
    this._name = value
  }

  getName(): string {
    return this._name
  }

  setRegionRange(value: GeolocusObject): void {
    this._regionRange = value
  }

  getRegionRange(): GeolocusObject {
    return this._regionRange
  }

  setObjectMap(value: ObjectMap): void {
    this._objectMap = value
  }

  getObjectMap(): ObjectMap {
    return this._objectMap
  }

  setPluginMap(value: Map<GeolocusPlugin, Function>): void {
    this._pluginMap = value
  }

  getPluginMap(): Map<GeolocusPlugin, Function> {
    return this._pluginMap
  }

  getPlugin(type: 'place'): PlacePlugin
  getPlugin(type: GeolocusPlugin): Function | null {
    if (type === 'place') {
      const plugin = this._pluginMap.get(type) as PlacePlugin
      return plugin
    }
    return null
  }

  setRelation(value: Relation): void {
    this._relation = value
  }

  getRelation(): Relation {
    return this._relation
  }

  setRoute(value: Route): void {
    this._route = value
  }

  getRoute(): Route {
    return this._route
  }

  setRoleMap(value: Map<string, Role>): void {
    this._roleMap = value
  }

  getRoleMap(): Map<string, Role> {
    return this._roleMap
  }

  setResultMap(value: Map<string, RegionResult>): void {
    this._resultMap = value
  }

  getResultMap(): Map<string, RegionResult> {
    return this._resultMap
  }

  getRegionResultByObjectUUID(uuid: string) {
    return this._resultMap.get(uuid)
  }

  setMaxDistance(value: number): void {
    this._maxDistance = value
  }

  getMaxDistance(): number {
    return this._maxDistance
  }

  setGridSize(value: number): void {
    this._gridSize = value
  }

  getGridSize(): number {
    return this._gridSize
  }
}
