import { TGeolocusObject } from '@/object'
import { Region } from '@/region'
import { Relation, TAbsoluteDirection, TRelativeDirection } from '@/relation'
import { GEO_MAX_VALUE } from '@/util'
import { randomUUID } from 'crypto'
import {
  IGeolocusContext,
  IGeolocusGlobalContextInit,
  IGeolocusLocalContextInit,
  TDirectionDelta,
  TGeolocusContext,
  TSemanticDistanceMap,
} from './context.type'
import { Route } from './route'

export class GeolocusGlobalContext implements IGeolocusContext {
  private _uuid: string
  private _objectMap: Map<string, TGeolocusObject>
  private _route: Route
  private _relation: Relation
  private _region: Region
  private _name: string
  private _orientation: number
  private _directionDelta: TDirectionDelta
  private _distanceDelta: number
  private _semanticDistanceMap: TSemanticDistanceMap
  private _resultGirdNum: number

  constructor(init: IGeolocusGlobalContextInit | null = null) {
    this._uuid = randomUUID()
    this._objectMap = new Map()
    this._route = new Route(this)
    this._relation = new Relation(this)
    this._region = new Region(this)

    this._name = init?.name || 'default'
    this._orientation = init?.orientation || 0
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

  getUUID = (): string => {
    return this._uuid
  }

  getObjectByObjectUUID = (uuid: string): TGeolocusObject | undefined => {
    return this._objectMap.get(uuid)
  }

  getObjectMap = (): Map<string, TGeolocusObject> => {
    return this._objectMap
  }

  getRoute = (): Route => {
    return this._route
  }

  getRelation = (): Relation => {
    return this._relation
  }

  getRegion = (): Region => {
    return this._region
  }

  getName = (): string => {
    return this._name
  }

  getOrientation = (): number => {
    return this._orientation
  }

  getDirectionDelta = (
    direction: TAbsoluteDirection | TRelativeDirection,
  ): [number, number] => {
    const AbsoluteDirectionMap = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    if (AbsoluteDirectionMap.includes(direction)) {
      return this._directionDelta[direction as TAbsoluteDirection]
    } else {
      // relativeDirection to TAbsoluteDirection
      const directionTransform = direction
        .replace('F', 'N')
        .replace('B', 'S')
        .replace('R', 'E')
        .replace('L', 'W') as TAbsoluteDirection
      const delta = this._directionDelta[directionTransform]
      // add offset of angle
      return [delta[0] + this._orientation, delta[1]]
    }
  }

  getDistanceDelta = (): number => {
    return this._distanceDelta
  }

  getSemanticDistanceMap = (): TSemanticDistanceMap => {
    return this._semanticDistanceMap
  }

  getResultGirdNum = (): number => {
    return this._resultGirdNum
  }
}

export class GeolocusLocalContext implements IGeolocusContext {
  private _uuid: string
  private _parentContext: TGeolocusContext
  private _name: string
  private _orientation: number
  private _directionDelta: TDirectionDelta
  private _distanceDelta: number
  private _semanticDistanceMap: TSemanticDistanceMap
  private _resultGirdNum: number

  constructor(init: IGeolocusLocalContextInit) {
    this._uuid = init.parentContext.getUUID()
    this._parentContext = init.parentContext
    this._name = init.name || 'default'
    this._orientation = init.orientation || 0
    this._directionDelta = init.directionDelta || {
      N: [0, Math.PI / 3],
      NE: [Math.PI / 4, Math.PI / 6],
      E: [Math.PI / 2, Math.PI / 3],
      SE: [(Math.PI / 4) * 3, Math.PI / 6],
      S: [Math.PI, Math.PI / 3],
      SW: [(Math.PI / 4) * 5, Math.PI / 6],
      W: [(Math.PI / 2) * 3, Math.PI / 3],
      NW: [(Math.PI / 4) * 7, Math.PI / 6],
    }
    this._distanceDelta = init.distanceDelta || 0.2
    this._semanticDistanceMap = init.semanticDistanceMap || [
      [0, 400],
      [400, 1000],
      [1000, 2500],
      [2500, 5000],
      [5000, GEO_MAX_VALUE],
    ]
    this._resultGirdNum = init.resultGirdNum || 16384
  }

  getUUID = (): string => {
    return this._uuid
  }

  getObjectByObjectUUID = (uuid: string): TGeolocusObject | undefined => {
    return this._parentContext.getObjectMap().get(uuid)
  }

  getObjectMap = (): Map<string, TGeolocusObject> => {
    return this._parentContext.getObjectMap()
  }

  getRoute = (): Route => {
    return this._parentContext.getRoute()
  }

  getRelation = (): Relation => {
    return this._parentContext.getRelation()
  }

  getRegion = (): Region => {
    return this._parentContext.getRegion()
  }

  getName = (): string => {
    return this._name
  }

  getOrientation = (): number => {
    return this._orientation
  }

  getDirectionDelta = (
    direction: TAbsoluteDirection | TRelativeDirection,
  ): [number, number] => {
    const AbsoluteDirectionMap = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    if (AbsoluteDirectionMap.includes(direction)) {
      return this._directionDelta[direction as TAbsoluteDirection]
    } else {
      const directionTransform = direction
        .replace('F', 'N')
        .replace('B', 'S')
        .replace('R', 'E')
        .replace('L', 'W') as TAbsoluteDirection
      const delta = this._directionDelta[directionTransform]
      return [delta[0] + this._orientation, delta[1]]
    }
  }

  getDistanceDelta = (): number => {
    return this._distanceDelta
  }

  getSemanticDistanceMap = (): TSemanticDistanceMap => {
    return this._semanticDistanceMap
  }

  getResultGirdNum = (): number => {
    return this._resultGirdNum
  }
}
