import { BBox } from 'geojson'
import { GeolocusContext } from '../context'
import { Compare, GEO_MAX_VALUE } from '../math'
import { GeolocusPolygonObject } from '../object'
import { GeolocusBBox, GeolocusObject, IGeoTriple, Position2 } from '../type'
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
import { IRegionResult } from './type'

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

export class Region {
  private _resultMap: Map<string, IRegionResult>
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._resultMap = new Map()
    this._context = context
  }

  getResultByUUID(uuid: string) {
    return this._resultMap.get(uuid)
  }

  computeResult(uuid: string) {
    const context = this._context
    const route = context.getRoute()
    const computedOrderStack = route.validateFuzzy(uuid)
    if (!computedOrderStack) {
      throw new Error(
        'Can not compute this object or it is not necessary be computed.',
      )
    }
    const uuidArray = computedOrderStack.slice()

    const relation = context.getRelation()
    while (computedOrderStack.length > 0) {
      const currentUUID = computedOrderStack.pop() as string
      const result: IRegionResult = {
        region: GeolocusPolygonObject.fromBBox(
          [-GEO_MAX_VALUE, -GEO_MAX_VALUE, GEO_MAX_VALUE, GEO_MAX_VALUE],
          null,
        ),
        PDF: new Set(),
        position: null,
        gird: null,
      }
      const tripleSet = relation.getGeoTripleByUUID(
        currentUUID,
      ) as Set<IGeoTriple>
      for (const triple of tripleSet) {
        const relation = triple.relation
        const origin = context.getObjectByUUID(triple.origin) as GeolocusObject
        const target = context.getObjectByUUID(triple.target) as GeolocusObject
        const topologyTag = relation.topology ? 1 : 0
        const directionTag = relation.direction ? 3 : 0
        const distanceTag = relation.distance ? 7 : 0
        const tag = (topologyTag +
          directionTag +
          distanceTag) as keyof typeof map

        map[tag](origin, relation, target, result)
        if (!result.region) {
          throw new Error("Can't compute the fuzzy region.")
        }
      }
      this._resultMap.set(currentUUID, result)
      const { gird } = this.getMembershipGridOfRegion(currentUUID)
      const coord = this.getCoordOfMaxMembershipValue(currentUUID, gird, 1)
      result.position = coord[0]
      result.gird = gird

      const object = context.getObjectByUUID(currentUUID) as GeolocusObject
      const center = object.getCenter()
      object.setFuzzy(false)
      // TODO 多个 1 如何处理
      object.translate(center, coord[0])
    }

    return uuidArray
  }

  getMembershipOfPoint(uuid: string, coord: Position2) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const pdf = result.PDF
    let value = 0
    pdf.forEach((currentPDF) => {
      value += RegionPDF.computePDF(currentPDF, coord)
    })
    return value
  }

  getMembershipGridOfBBox(uuid: string, bbox: BBox) {
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
        const value = this.getMembershipOfPoint(uuid, [col, row])
        if (value > max) max = value
        if (value < min) min = value
        temp.push(value)
      }
      gird.push(temp)
    }
    if (max !== min) {
      for (let col = 0; col < gird.length; col++) {
        for (let row = 0; row < gird[0].length; row++) {
          gird[col][row] = (gird[col][row] - min) / (max - min)
        }
      }
    } else {
      for (let col = 0; col < gird.length; col++) {
        for (let row = 0; row < gird[0].length; row++) {
          gird[col][row] = 1
        }
      }
    }

    return gird
  }

  getMembershipGridOfRegion(uuid: string) {
    const result = this.getResultByUUID(uuid)
    const context = this._context
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const region = result.region
    if (!region) {
      throw new Error('The fuzzy region is null.')
    }
    const bbox = region.getBBox()
    const relation = context.getRelation()
    const tripleSet = relation.getGeoTripleByUUID(uuid) as Set<IGeoTriple>
    for (const triple of tripleSet) {
      const originBBox = context
        .getObjectByUUID(triple.origin)
        ?.getBBox() as GeolocusBBox
      if (originBBox[0] < bbox[0]) bbox[0] = originBBox[0]
      if (originBBox[1] < bbox[1]) bbox[1] = originBBox[1]
      if (originBBox[2] > bbox[2]) bbox[2] = originBBox[2]
      if (originBBox[3] > bbox[3]) bbox[3] = originBBox[3]
    }

    const gird = this.getMembershipGridOfBBox(uuid, bbox)

    return {
      gird,
      bbox,
    }
  }

  getCoordOfMaxMembershipValue(uuid: string, gird: number[][], value = 0.995) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const region = result.region
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
        if (Compare.GE(gird[col][row], value)) {
          points.push([col, row])
        }
      }
    }

    const coord = points.map((colRow) => [
      (colRow[0] / gird.length) * dx + xStart,
      (colRow[1] / gird[0].length) * dy + yStart,
    ])

    return coord as Position2[]
  }
}
