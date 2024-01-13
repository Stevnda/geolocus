import { Region } from '@/region'
import { Relation } from '@/relation'
import {
  AbsoluteDirection,
  EuclideanDistanceRange,
  GeolocusObject,
} from '@/type'
import { GEO_MAX_VALUE } from '@/util'
import { Route } from './route'

export class GeolocusContext {
  private _name: string
  private _objectMap: Map<string, GeolocusObject>
  private _route: Route
  private _relation: Relation
  private _region: Region
  private _directionDelta: {
    [props in AbsoluteDirection]: [number, number]
  }
  private _distanceDelta: number
  private _semanticDistanceThreshold: [
    EuclideanDistanceRange,
    EuclideanDistanceRange,
    EuclideanDistanceRange,
    EuclideanDistanceRange,
    EuclideanDistanceRange,
  ]
  private _resultGirdNum = 16384

  constructor(name: string) {
    this._name = name
    this._objectMap = new Map()
    this._route = new Route(this)
    this._relation = new Relation(this)
    this._region = new Region(this)
    this._directionDelta = {
      N: [0, Math.PI / 3],
      NE: [Math.PI / 4, Math.PI / 6],
      E: [Math.PI / 2, Math.PI / 3],
      SE: [(Math.PI / 4) * 3, Math.PI / 6],
      S: [Math.PI, Math.PI / 3],
      SW: [(Math.PI / 4) * 5, Math.PI / 6],
      W: [(Math.PI / 2) * 3, Math.PI / 3],
      NW: [(Math.PI / 4) * 7, Math.PI / 6],
    }
    this._distanceDelta = 0.2
    this._semanticDistanceThreshold = [
      [0, 400],
      [400, 1000],
      [1000, 2500],
      [2500, 5000],
      [5000, GEO_MAX_VALUE],
    ]
  }

  getName() {
    return this._name
  }

  addObject(uuid: string, object: GeolocusObject): void {
    this._objectMap.set(uuid, object)
  }

  getObjectByUUID(key: string): GeolocusObject | undefined {
    return this._objectMap.get(key)
  }

  getAllObject(): Map<string, GeolocusObject> {
    return this._objectMap
  }

  getRoute() {
    return this._route
  }

  getRelation() {
    return this._relation
  }

  getRegion() {
    return this._region
  }

  getResultGirdNum() {
    return this._resultGirdNum
  }

  setDirectionDelta(value: number): void
  setDirectionDelta(
    ordinalDirection: number,
    cardinalDirection?: number,
  ): void {
    if (!cardinalDirection) {
      cardinalDirection = ordinalDirection
    }
    this._directionDelta = {
      N: [0, cardinalDirection],
      NE: [Math.PI / 4, ordinalDirection],
      E: [Math.PI / 2, cardinalDirection],
      SE: [(Math.PI / 4) * 3, ordinalDirection],
      S: [Math.PI, cardinalDirection],
      SW: [(Math.PI / 4) * 5, ordinalDirection],
      W: [(Math.PI / 2) * 3, cardinalDirection],
      NW: [(Math.PI / 4) * 7, ordinalDirection],
    }
  }

  getDirectionDelta() {
    return this._directionDelta
  }

  setDistanceDelta(value: number): void {
    this._distanceDelta = value
  }

  getDistanceDelta(): number {
    return this._distanceDelta
  }

  setSemanticDistanceThreshold(
    value: [
      EuclideanDistanceRange,
      EuclideanDistanceRange,
      EuclideanDistanceRange,
      EuclideanDistanceRange,
      EuclideanDistanceRange,
    ],
  ): void {
    this._semanticDistanceThreshold = value
  }

  getSemanticDistanceThreshold() {
    return this._semanticDistanceThreshold
  }
}
