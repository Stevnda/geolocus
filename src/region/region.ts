/* eslint-disable @typescript-eslint/no-unused-vars */
import { BBox } from 'geojson'
import {
  GeolocusObject,
  GeolocusPolygonObject,
  MaxBBoxPolygon,
} from '../object'
import { GeolocusMultiPolygonObject } from '../object/object'
import { IGeoRelation } from '../relation'
import { Position2 } from '../type'
import {
  regionHandlerOfDirection,
  regionHandlerOfDistance,
  regionHandlerOfTopology,
} from './handler'

export interface IGeoTriple {
  origin: GeolocusObject
  relation: IGeoRelation
  target: GeolocusObject
}

export interface IRegionPDF {
  type: 0 | 1 | 2 | 3
  origin: Position2
  distance: number | null
  distanceDelta: number | null
  azimuth: number | null
  azimuthDelta: number | null
}

export interface IRegionResult {
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
  PDF: IRegionPDF[]
}

export class Region {
  private _tuple: IGeoTriple[]
  private _result: IRegionResult

  constructor(triples: IGeoTriple[]) {
    this._tuple = triples
    this._result = {
      region: MaxBBoxPolygon.clone(),
      PDF: [],
    }
  }

  computeTarget() {
    const length = this._tuple.length
    for (let index = 0; index < length; index++) {
      const triple = this._tuple[index]
      const relation = triple.relation
      const origin = triple.origin
      const target = triple.target

      const topology = relation.topology ? 0 : 1
      const direction = relation.direction ? 0 : 3
      const distance = relation.distance ? 0 : 7
      const tag = topology + direction + distance

      const map = {
        0: () => {
          throw new Error('The geoRelation is null.')
        },
        1: regionHandlerOfTopology,
        3: regionHandlerOfDirection,
        7: regionHandlerOfDistance,
        // 4: topologyDirectionHandler,
        // 8: topologyDistanceHandler,
        // 10: directionDistanceHandler,
        // 11: allRelationHandler,
      }

      if (!this._result.region) {
        throw new Error("Can't compute the fuzzy region.")
      }
    }
  }

  getProbabilityOfPoint(coord: Position2) {
    return this._result
  }

  getProbabilityOfBBox(extent: BBox) {
    //
  }

  getProbabilityImage(extent: BBox) {
    //
  }

  getMaxProbabilityCoordinate() {
    //
  }
}
