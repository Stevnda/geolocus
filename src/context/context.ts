import { Region } from '@/region'
import { Relation } from '@/relation'
import { GeolocusObject } from '@/type'
import { GEO_MAX_VALUE } from '@/util'
import { Route } from './route'
import {
  DirectionDelta,
  IGeolocusContext,
  IGeolocusContextInit,
  SemanticDistanceMap,
} from './type'

export class GeolocusContext implements IGeolocusContext {
  private _objectMap: Map<string, GeolocusObject>
  private _route: Route
  private _relation: Relation
  private _region: Region
  private _name: string
  private _directionDelta: DirectionDelta
  private _distanceDelta: number
  private _semanticDistanceMap: SemanticDistanceMap
  private _resultGirdNum: number

  constructor(init?: IGeolocusContextInit) {
    this._objectMap = new Map()
    this._route = new Route(this)
    this._relation = new Relation(this)
    this._region = new Region(this)

    this._name = init?.name || 'default'
    this._directionDelta = init?.directionDelta || {
      N: [0, Math.PI / 3],
      NE: [Math.PI / 4, Math.PI / 6],
      E: [Math.PI / 2, Math.PI / 3],
      SE: [(Math.PI / 4) * 3, Math.PI / 6],
      S: [Math.PI, Math.PI / 3],
      SW: [(Math.PI / 4) * 5, Math.PI / 6],
      W: [(Math.PI / 2) * 3, Math.PI / 3],
      NW: [(Math.PI / 4) * 7, Math.PI / 6],
    }
    this._distanceDelta = init?.distanceDelta || 0.2
    this._semanticDistanceMap = init?.semanticDistanceMap || [
      [0, 400],
      [400, 1000],
      [1000, 2500],
      [2500, 5000],
      [5000, GEO_MAX_VALUE],
    ]
    this._resultGirdNum = init?.resultGirdNum || 16384
  }

  addObject(uuid: string, object: GeolocusObject): void {
    this._objectMap.set(uuid, object)
  }

  getObjectByUUID(key: string): GeolocusObject | undefined {
    return this._objectMap.get(key)
  }

  getObjectMap(): Map<string, GeolocusObject> {
    return this._objectMap
  }

  getRoute(): Route {
    return this._route
  }

  getRelation(): Relation {
    return this._relation
  }

  getRegion(): Region {
    return this._region
  }

  getName(): string {
    return this._name
  }

  getDirectionDelta(): DirectionDelta {
    return this._directionDelta
  }

  getDistanceDelta(): number {
    return this._distanceDelta
  }

  getSemanticDistanceMap(): SemanticDistanceMap {
    return this._semanticDistanceMap
  }

  getResultGirdNum(): number {
    return this._resultGirdNum
  }
}
