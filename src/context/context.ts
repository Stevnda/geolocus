import { Region } from '../region'
import { Relation } from '../relation'
import { AbsoluteDirection, GeolocusObject } from '../type'
import { GEO_MAX_VALUE } from '../util'
import { Route } from './route'

export class GeolocusContext {
  private _name: string
  private _object: Map<string, GeolocusObject>
  private _route: Route
  private _relation: Relation
  private _region: Region
  private _scale: number
  private _distanceDelta: number
  private _semanticDistanceThreshold: [
    number,
    number,
    number,
    number,
    number,
    number,
  ]

  private _girdSize = 16384

  private _directionDelta: {
    [props in AbsoluteDirection]: [number, number]
  }

  constructor(name: string) {
    this._name = name
    this._object = new Map()
    this._route = new Route(this)
    this._relation = new Relation(this)
    this._region = new Region(this)
    this._scale = 5000
    this._distanceDelta = 0.2
    this._semanticDistanceThreshold = [
      0,
      1 / 6,
      0.5,
      1,
      2,
      GEO_MAX_VALUE / this._scale,
    ]
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
  }

  getName() {
    return this._name
  }

  addObject(uuid: string, object: GeolocusObject): void {
    this._object.set(uuid, object)
  }

  getObjectByUUID(key: string): GeolocusObject | undefined {
    return this._object.get(key)
  }

  getAllObject(): Map<string, GeolocusObject> {
    return this._object
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

  getGirdSize() {
    return this._girdSize
  }

  setScale(value: number): void {
    this._scale = value
  }

  getScale(): number {
    return this._scale
  }

  setDistanceDelta(value: number): void {
    this._distanceDelta = value
  }

  getDistanceDelta(): number {
    return this._distanceDelta
  }

  setSemanticDistanceThreshold(value: [number, number, number, number]): void {
    this._semanticDistanceThreshold = [0, ...value, GEO_MAX_VALUE / this._scale]
  }

  getSemanticDistanceThreshold() {
    return this._semanticDistanceThreshold
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
}
