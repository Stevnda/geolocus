import { GeolocusContext } from '../context'
import { Compare, GEO_MAX_VALUE } from '../math'
import {
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'
import { Topology } from '../relation'
import { GeolocusObject, IGeoTriple, Position2 } from '../type'
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
import { IRegionResult, RegionGird } from './type'

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

  computeFuzzyObject(uuid: string) {
    const context = this._context
    const route = context.getRoute()
    const computedOrderStack = route.validateFuzzy(uuid)
    if (!computedOrderStack) {
      throw new Error(
        'Can not compute this object or it is not necessary be computed.',
      )
    }

    const relation = context.getRelation()
    const uuidArray = computedOrderStack.slice()
    while (computedOrderStack.length > 0) {
      const currentUUID = computedOrderStack.pop() as string
      const result: IRegionResult = {
        region: GeolocusPolygonObject.fromBBox(
          [-GEO_MAX_VALUE, -GEO_MAX_VALUE, GEO_MAX_VALUE, GEO_MAX_VALUE],
          null,
        ),
        pdf: [],
        coord: null,
        pdfGird: [],
        resultGird: null,
        mask: null,
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

      result.mask = this.getRegionMask(currentUUID)
      const gird = this.getRegionGrid(currentUUID)
      result.resultGird = gird
      const { coord } = this.getCoordOfMaximum(currentUUID)
      result.coord = coord

      const object = context.getObjectByUUID(currentUUID) as GeolocusObject
      const center = object.getCenter()
      object.setFuzzy(false)
      object.translate(center, coord)
    }

    return uuidArray
  }

  private getRegionMask(uuid: string) {
    const result = this.getResultByUUID(uuid) as IRegionResult
    // if (!result) {
    //   throw new Error('The result of this uuid is not existed.')
    // }
    const region = result.region as
      | GeolocusPolygonObject
      | GeolocusMultiPolygonObject
    const bbox = region.getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(this._context.getGirdSize() / ratio)

    const mask = []
    for (let y = yStart, row = 0; y < yEnd; y += girdSize, row++) {
      const temp: number[] = []
      for (let x = xStart, col = 0; x < xEnd; x += girdSize, col++) {
        const tempPoint = new GeolocusPointObject([x, y])
        if (Topology.isIntersect(tempPoint, region)) {
          temp.push(1)
        } else {
          temp.push(0)
        }
      }
      mask.push(temp)
    }

    return mask
  }

  getRegionGrid(uuid: string) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const region = result.region as GeolocusMultiPolygonObject
    const bbox = region.getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(this._context.getGirdSize() / ratio)

    const mask = result.mask as RegionGird
    const pdfArray = result.pdf
    const pdfGirdArray = result.pdfGird
    pdfArray.forEach((currentPdf) => {
      let gird: RegionGird = []
      if (currentPdf.type === 4) {
        gird = RegionPDF.computePDF(currentPdf, result)
      } else {
        for (let y = yStart, row = 0; y < yEnd; y += girdSize, row++) {
          const temp: number[] = []
          for (let x = xStart, col = 0; x < xEnd; x += girdSize, col++) {
            if (mask[row][col]) {
              temp.push(RegionPDF.computePDF(currentPdf, result, [x, y]))
            } else {
              temp.push(0)
            }
          }
          gird.push(temp)
        }
      }
      pdfGirdArray.push(gird)
    })

    const resultGird: RegionGird = []
    for (let row = 0; row < mask.length; row++) {
      const temp = []
      for (let col = 0; col < mask[0].length; col++) {
        temp.push(1)
      }
      resultGird.push(temp)
    }
    pdfGirdArray.forEach((currentGird) => {
      for (let row = 0; row < currentGird.length; row++) {
        for (let col = 0; col < currentGird[0].length; col++) {
          resultGird[row][col] *= currentGird[row][col]
        }
      }
    })

    let max = -GEO_MAX_VALUE
    for (let row = 0; row < resultGird.length; row++) {
      for (let col = 0; col < resultGird[0].length; col++) {
        if (resultGird[row][col] > max) max = resultGird[row][col]
      }
    }
    if (max !== 0) {
      for (let row = 0; row < resultGird.length; row++) {
        for (let col = 0; col < resultGird[0].length; col++) {
          resultGird[row][col] = resultGird[row][col] / max
        }
      }
    }

    return resultGird
  }

  getCoordOfMaximum(uuid: string) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const resultGrid = result.resultGird as RegionGird
    // if (!resultGrid) {
    //   throw new Error('Please compute the object first.')
    // }

    const region = result.region as
      | GeolocusPolygonObject
      | GeolocusMultiPolygonObject
    const bbox = region.getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(this._context.getGirdSize() / ratio)

    let max = -GEO_MAX_VALUE
    let coord: Position2 = [0, 0]
    for (let y = yStart, row = 0; y < yEnd; y += girdSize, row++) {
      for (let x = xStart, col = 0; x < xEnd; x += girdSize, col++) {
        if (Compare.GE(resultGrid[row][col], max)) {
          max = resultGrid[row][col]
          coord = [x, y]
        }
      }
    }

    return { coord, max }
  }
}
