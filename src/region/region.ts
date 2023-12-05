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
      const { coord } = this.getMaxValueAndCoord(currentUUID)
      result.coord = coord

      const object = context.getObjectByUUID(currentUUID) as GeolocusObject
      const center = object.getCenter()
      object.setFuzzy(false)
      object.translate(center, coord)
    }

    return uuidArray
  }

  private getRegionMask(uuid: string) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
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
    for (let x = xStart, col = 0; x < xEnd; x += girdSize, col++) {
      const temp = []
      for (let y = yStart, row = 0; y < yEnd; y += girdSize, row++) {
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
      const gird = []
      for (let x = xStart, col = 0; x < xEnd; x += girdSize, col++) {
        const temp = []
        for (let y = yStart, row = 0; y < yEnd; y += girdSize, row++) {
          if (mask[col][row]) {
            temp.push(RegionPDF.computePDF(currentPdf, [x, y]))
          } else {
            temp.push(0)
          }
        }
        gird.push(temp)
      }
      pdfGirdArray.push(gird)
    })

    const resultGird: RegionGird = []
    for (let col = 0; col < mask.length; col++) {
      const temp = []
      for (let row = 0; row < mask[0].length; row++) {
        temp.push(1)
      }
      resultGird.push(temp)
    }
    pdfGirdArray.forEach((currentGird) => {
      for (let col = 0; col < currentGird.length; col++) {
        for (let row = 0; row < currentGird[0].length; row++) {
          resultGird[col][row] *= currentGird[col][row]
        }
      }
    })

    let max = -GEO_MAX_VALUE
    for (let col = 0; col < resultGird.length; col++) {
      for (let row = 0; row < resultGird[0].length; row++) {
        if (resultGird[col][row] > max) max = resultGird[col][row]
      }
    }
    if (max !== 0) {
      for (let col = 0; col < resultGird.length; col++) {
        for (let row = 0; row < resultGird[0].length; row++) {
          resultGird[col][row] = resultGird[col][row] / max
        }
      }
    }

    return resultGird
  }

  getMaxValueAndCoord(uuid: string) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const resultGrid = result.resultGird
    if (!resultGrid) {
      throw new Error('Please compute the object first.')
    }

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
    for (let x = xStart, col = 0; x < xEnd; x += girdSize, col++) {
      for (let y = yStart, row = 0; y < yEnd; y += girdSize, row++) {
        if (Compare.GE(resultGrid[col][row], max)) {
          max = resultGrid[col][row]
          coord = [x, y]
        }
      }
    }

    return { coord, max }
  }

  // getMembershipValueOfPoint(uuid: string, coord: Position2) {
  //   const result = this.getResultByUUID(uuid)
  //   if (!result) {
  //     throw new Error('The result of this uuid is not existed.')
  //   }
  //   const pdf = result.pdf
  //   let value = 1
  //   pdf.forEach((currentPDF) => {
  //     const memberShipValue = RegionPDF.computePDF(currentPDF, coord)
  //     value *= memberShipValue
  //   })

  //   return value
  // }

  // getMembershipGridOfRegion(uuid: string) {
  //   const result = this.getResultByUUID(uuid)
  //   if (!result) {
  //     throw new Error('The result of this uuid is not existed.')
  //   }
  //   const region = result.region as
  //     | GeolocusPolygonObject
  //     | GeolocusMultiPolygonObject
  //   const context = this._context
  //   const bbox = region.getBBox()
  //   const relation = context.getRelation()
  //   const tripleSet = relation.getGeoTripleByUUID(uuid) as Set<IGeoTriple>
  //   for (const triple of tripleSet) {
  //     const originBBox = context
  //       .getObjectByUUID(triple.origin)
  //       ?.getBBox() as GeolocusBBox
  //     if (originBBox[0] < bbox[0]) bbox[0] = originBBox[0]
  //     if (originBBox[1] < bbox[1]) bbox[1] = originBBox[1]
  //     if (originBBox[2] > bbox[2]) bbox[2] = originBBox[2]
  //     if (originBBox[3] > bbox[3]) bbox[3] = originBBox[3]
  //   }

  //   const { gird, range } = this.getMembershipGridOfBBox(uuid, bbox)

  //   return {
  //     gird,
  //     range,
  //     bbox,
  //   }
  // }
}
