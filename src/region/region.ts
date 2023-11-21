/* eslint-disable @typescript-eslint/no-unused-vars */
import { BBox } from 'geojson'
import { Compare } from '../math'
import {
  GeolocusObject,
  GeolocusPolygonObject,
  MaxBBoxPolygon,
} from '../object'
import { GeolocusMultiPolygonObject } from '../object/object'
import { IGeoRelation } from '../relation'
import { Position2 } from '../type'
import {
  regionHandlerOfAll,
  regionHandlerOfDirection,
  regionHandlerOfDirectionAndDistance,
  regionHandlerOfDistance,
  regionHandlerOfTopology,
  regionHandlerOfTopologyAndDirection,
  regionHandlerOfTopologyAndDistance,
} from './handler'
import { RegionPDF } from './pdf'

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

  computeResult() {
    const map = {
      0: () => {
        throw new Error('The geoRelation is null.')
      },
      1: regionHandlerOfTopology,
      3: regionHandlerOfDirection,
      7: regionHandlerOfDistance,
      4: regionHandlerOfTopologyAndDirection,
      8: regionHandlerOfTopologyAndDistance,
      10: regionHandlerOfDirectionAndDistance,
      11: regionHandlerOfAll,
    }

    const length = this._tuple.length
    for (let index = 0; index < length; index++) {
      const triple = this._tuple[index]
      const relation = triple.relation
      const origin = triple.origin
      const target = triple.target
      const topologyTag = relation.topology ? 1 : 0
      const directionTag = relation.direction ? 3 : 0
      const distanceTag = relation.distance ? 7 : 0
      const tag = (topologyTag + directionTag + distanceTag) as keyof typeof map

      map[tag](origin, relation, target, this._result, index)

      if (!this._result.region) {
        throw new Error("Can't compute the fuzzy region.")
      }
    }
  }

  private getMembershipOfPoint(coord: Position2) {
    const pdf = this._result.PDF
    let value = 0
    const length = pdf.length
    for (let index = 0; index < length; index++) {
      const currentPDF = pdf[index]
      value += RegionPDF.computePDF(currentPDF, coord)
    }
    return value
  }

  private getMembershipGridOfBBox(bbox: BBox) {
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(16384 / ratio)

    const gird = []
    let min = Number.MAX_VALUE
    let max = -Number.MAX_VALUE
    for (let col = xStart; col < xEnd; col += girdSize) {
      const temp = []
      for (let row = yStart; row < yEnd; row += girdSize) {
        const value = this.getMembershipOfPoint([col, row])
        if (value > max) max = value
        if (value < min) min = value
        temp.push(this.getMembershipOfPoint([col, row]))
      }
      gird.push(temp)
    }

    for (let col = 0; col < gird.length; col++) {
      for (let row = 0; row < gird[0].length; row++) {
        gird[col][row] = (gird[col][row] - min) / (max - min)
      }
    }

    return gird
  }

  getMembershipGridOfRegion() {
    const region = this._result.region
    if (!region) {
      throw new Error('The fuzzy region is null.')
    }

    const bbox = region.getBBox()
    const length = this._tuple.length
    for (let index = 0; index < length; index++) {
      const triple = this._tuple[index]
      const originBBox = triple.origin.getBBox()
      if (originBBox[0] < bbox[0]) bbox[0] = originBBox[0]
      if (originBBox[1] < bbox[1]) bbox[1] = originBBox[1]
      if (originBBox[2] > bbox[2]) bbox[2] = originBBox[2]
      if (originBBox[3] > bbox[3]) bbox[3] = originBBox[3]
    }

    return {
      gird: this.getMembershipGridOfBBox(bbox),
      bbox,
    }
  }

  getCoordOfMaxMembershipValue(gird: number[][], value = 0.995) {
    const region = this._result.region
    if (!region) {
      throw new Error('The fuzzy region is null.')
    }
    const bbox = region.getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart

    const points: Position2[] = []
    for (let col = 0; col < gird.length; col++) {
      for (let row = 0; row < gird[0].length; row++) {
        if (Compare.GT(gird[col][row], value)) {
          points.push([col, row])
        }
      }
    }

    const result = points.map((colRow) => [
      (colRow[0] / gird.length) * dx + xStart,
      (colRow[1] / gird[0].length) * dy + yStart,
    ])

    return result as Position2[]
  }
}
