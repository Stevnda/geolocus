import { GEO_MAX_VALUE } from '../math'
import { GeolocusObject } from '../object'
import { Relation } from '../relation'
import { AbsoluteDirection } from '../type'
import { Route } from './route'

class GeolocusContext {
  private _ROUTE: Route | null = null
  private _RELATION: Relation | null = null
  OBJECT: Map<string, GeolocusObject> = new Map()
  DISTANCE_DELTA = 0.2
  DIRECTION_PARAM: {
    [props in AbsoluteDirection]: [number, number]
  } = {
    N: [0, Math.PI / 3],
    NE: [Math.PI / 4, Math.PI / 6],
    E: [Math.PI / 2, Math.PI / 3],
    SE: [(Math.PI / 4) * 3, Math.PI / 6],
    S: [Math.PI, Math.PI / 3],
    SW: [(Math.PI / 4) * 5, Math.PI / 6],
    W: [(Math.PI / 2) * 3, Math.PI / 3],
    NW: [(Math.PI / 4) * 7, Math.PI / 6],
  }

  SCALE = 5000
  SEMANTIC_DISTANCE_THRESHOLD = [
    0,
    1 / 6,
    0.5,
    1,
    2,
    GEO_MAX_VALUE / this.SCALE,
  ]

  getRoute() {
    if (!this._ROUTE) {
      this._ROUTE = new Route()
    }
    return this._ROUTE
  }

  getRelation() {
    if (!this._RELATION) {
      this._RELATION = new Relation()
    }
    return this._RELATION
  }

  setDistanceDelta(value: number) {
    this.DISTANCE_DELTA = value
  }

  setDirectionDelta(value: number): void
  setDirectionDelta(
    ordinalDirection: number,
    cardinalDirection?: number,
  ): void {
    if (!cardinalDirection) {
      cardinalDirection = ordinalDirection
    }
    this.DIRECTION_PARAM = {
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

  setScale(value: number): void {
    this.SCALE = value
  }
}

export const instance = new GeolocusContext()
