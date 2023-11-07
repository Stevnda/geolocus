/* eslint-disable @typescript-eslint/no-unused-vars */
import { BBox } from 'geojson'
import { Vector2 } from '../math'
import {
  GeolocusObject,
  GeolocusPolygonObject,
  MaxBBoxPolygon,
} from '../object'
import { GeolocusMultiPolygonObject } from '../object/object'
import { IGeoRelation } from '../relation'
import { Topology, TopologyRelation } from '../relation/topology'
import { Position2 } from '../type'

export interface IGeoTriple {
  origin: GeolocusObject
  relation: IGeoRelation
  target: GeolocusObject
}

export interface IRegionResult {
  region: GeolocusPolygonObject | GeolocusMultiPolygonObject | null
  PDF: {
    type: 0 | 1 | 2 | 3
    origin: Position2
    distance: number | null
    distanceDelta: number | null
    azimuth: number | null
    azimuthDelta: number | null
  }[]
}

export interface IRegionHandler {
  (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
    result: IRegionResult,
    index: number,
  ): void
}

const DISTANCE_DELTA = 0.2

const topologyHandler: IRegionHandler = (
  origin: GeolocusObject,
  relation: IGeoRelation,
  target: GeolocusObject,
  result: IRegionResult,
  index: number,
) => {
  const region = result.region
  if (!region) {
    throw new Error("Can't compute the fuzzy region.")
  }

  const topology = relation.topology as TopologyRelation
  const map: {
    [props in TopologyRelation]: () => void
  } = {
    equal: () => {
      const fuzzyRegion = Topology.bufferOfDistance(origin, 1)
      result.region = Topology.intersection(fuzzyRegion, region)

      result.PDF[index] = {
        type: 0,
        origin: origin.getCenter(),
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      }
    },
    contain: () => {
      const originBBox = origin.getBBox()
      const length = Vector2.distanceTo(
        [originBBox[0], originBBox[1]],
        [originBBox[2], originBBox[3]],
      )

      const fuzzyRegion = Topology.bufferOfDistance(
        origin,
        length * DISTANCE_DELTA,
      )
      result.region = Topology.intersection(fuzzyRegion, region)
      result.PDF[index] = {
        type: 1,
        origin: origin.getCenter(),
        distance: 0,
        distanceDelta: length / 2,
        azimuth: null,
        azimuthDelta: null,
      }
    },
    intersect: () => {
      const targetBBox = target.getBBox()
      const distance = Vector2.distanceTo(
        [targetBBox[0], targetBBox[1]],
        [targetBBox[2], targetBBox[3]],
      )

      const fuzzyRegion = Topology.bufferOfDistance(
        origin,
        distance * DISTANCE_DELTA,
      )
      result.region = Topology.intersection(fuzzyRegion, region)
      result.PDF[index] = {
        type: 1,
        origin: origin.getCenter(),
        distance: 0,
        distanceDelta: distance / 2,
        azimuth: null,
        azimuthDelta: null,
      }
    },
    disjoint: () => {
      const targetBBox = target.getBBox()
      const distance = Vector2.distanceTo(
        [targetBBox[0], targetBBox[1]],
        [targetBBox[2], targetBBox[3]],
      )

      const buffer = Topology.bufferOfDistance(
        origin,
        distance * DISTANCE_DELTA,
      )
      const fuzzyRegion = Topology.mask(MaxBBoxPolygon, buffer)
      result.region = Topology.intersection(fuzzyRegion, region)
      result.PDF[index] = {
        type: 0,
        origin: origin.getCenter(),
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      }
    },
  }
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
        1: topologyHandler,
        // 3: directionHandler,
        // 7: distanceHandler,
        // 4: topologyDirectionHandler,
        // 8: topologyDistanceHandler,
        // 10: directionDistanceHandler,
        // 11: allRelationHandler,
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
