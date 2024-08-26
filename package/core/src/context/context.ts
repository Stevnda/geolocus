/* eslint-disable @typescript-eslint/ban-types */
import { GeolocusObject } from '@/object'
import { Route } from './route.actor'
import { Role } from './role.actor'
import { randomUUID } from 'crypto'
import { Relation } from '@/relation'
import { GeolocusPlugin, PlacePlugin } from './plugin'
import { GeolocusContextInit } from './context.type'
import { RegionResult } from '@/region'

interface GeolocusContextProps {
  setUUID(value: string): void
  getUUID(): string
  setName(value: string): void
  getName(): string
  setObjectMap(value: Map<string, GeolocusObject>): void
  getObjectMap(): Map<string, GeolocusObject>
  getObjectByObjectUUID(uuid: string): GeolocusObject | null
  setPlaceObjectMap(value: Map<string, string>): void
  getPlaceObjectMap(): Map<string, string>
  getObjectUUIDByPlaceName(place: string): string | null
  setPluginMap(value: Map<GeolocusPlugin, Function>): void
  getPluginMap(): Map<GeolocusPlugin, Function>
  setRelation(value: Relation): void
  getRelation(): Relation
  setRoute(value: Route): void
  getRoute(): Route
  setRoleMap(value: Map<string, Role>): void
  getRoleMap(): Map<string, Role>
  setResultMap(value: Map<string, RegionResult>): void
  getResultMap(): Map<string, RegionResult>
  setMaxDistance(value: number): void
  getMaxDistance(): number
  setGridSize(value: number): void
  getGridSize(): number
}

export class GeolocusContext implements GeolocusContextProps {
  private _uuid: string
  private _name: string
  private _objectMap: Map<string, GeolocusObject>
  private _placeObjectMap: Map<string, string>
  private _pluginMap: Map<GeolocusPlugin, Function>
  private _relation: Relation
  private _route: Route
  private _roleMap: Map<string, Role>
  private _resultMap: Map<string, RegionResult>
  private _maxDistance: number
  private _gridSize: number

  constructor(init: GeolocusContextInit) {
    this._uuid = randomUUID()
    this._name = init.name || 'default'
    this._objectMap = new Map() // the key is the uuid of object
    this._placeObjectMap = new Map() // placeName - objectUUID
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

  setObjectMap(value: Map<string, GeolocusObject>): void {
    this._objectMap = value
  }

  getObjectMap(): Map<string, GeolocusObject> {
    return this._objectMap
  }

  getObjectByObjectUUID(uuid: string): GeolocusObject | null {
    return this._objectMap.get(uuid) || null
  }

  addObject(uuid: string, object: GeolocusObject): void {
    this._objectMap.set(uuid, object)
  }

  setPlaceObjectMap(value: Map<string, string>): void {
    this._placeObjectMap = value
  }

  getPlaceObjectMap(): Map<string, string> {
    return this._placeObjectMap
  }

  getObjectUUIDByPlaceName(place: string): string | null {
    return this._placeObjectMap.get(place) || null
  }

  addPlaceName(placeName: string, objectUUID: string): void {
    this._placeObjectMap.set(placeName, objectUUID)
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
