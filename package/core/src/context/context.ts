/* eslint-disable @typescript-eslint/ban-types */
import { Route } from './route'
import { Role } from './role'
import { Relation } from '@/relation'
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
  private _roleMap: Map<string, Role>
  private _maxDistance: number
  private _gridSum: number // 输出概率栅格的栅格数量, 对应计算精度
  private _gridScale: number // 上下文的空间尺度, 用于空间结构

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
    this._relation = new Relation(this)
    this._route = new Route(this)
    this._roleMap = new Map() // the key is the name of role
    this._resultMap = new Map() // the uuid of resultMap is the same as geolocusObject
    this._maxDistance = init.maxDistance
    this._gridSum = init.gridSum || 128 * 128
    this._gridScale = init.gridScale
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

  setGridSum(value: number): void {
    this._gridSum = value
  }

  getGridSum(): number {
    return this._gridSum
  }

  getGridScale(): number {
    return this._gridScale
  }

  setGridScale(value: number): void {
    this._gridScale = value
  }
}
