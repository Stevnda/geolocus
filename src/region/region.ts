import { GeolocusContext } from '../context'
import { GeolocusMultiPolygonObject, GeolocusPolygonObject } from '../object'
import {
  EuclideanDistanceRange,
  GeolocusBBox,
  GeolocusGird,
  GeolocusObject,
  IGeoTriple,
  Position2,
} from '../type'
import { Compare, GEO_MAX_VALUE, Gird } from '../util'
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
import { IRegionPDF, IRegionResult, IRegionResultPdfGird } from './region.type'

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

  private getRegionAndPdf(
    uuid: string,
    result: IRegionResult,
    context: GeolocusContext,
  ) {
    const relation = context.getRelation()
    const tripleSet = relation.getGeoTripleByUUID(uuid) as Set<IGeoTriple>
    const resultPdf: IRegionPDF[] = []
    let resultRegion:
      | GeolocusPolygonObject
      | GeolocusMultiPolygonObject
      | null = result.region
    for (const triple of tripleSet) {
      if (!resultRegion) {
        throw new Error("Can't compute the fuzzy region.")
      }
      const relation = triple.relation
      const origin = context.getObjectByUUID(triple.origin) as GeolocusObject
      const target = context.getObjectByUUID(triple.target) as GeolocusObject
      const topologyTag = relation.topology ? 1 : 0
      const directionTag = relation.direction ? 3 : 0
      const distanceTag = relation.distance ? 7 : 0
      const tag = (topologyTag + directionTag + distanceTag) as keyof typeof map
      const { topologyPDF, topologyRegion } = map[tag](
        origin,
        relation,
        target,
        resultRegion,
      )
      resultRegion = topologyRegion
      resultPdf.push(topologyPDF)
    }
    return { resultRegion, resultPdf }
  }

  private getPdfGird(
    mask: GeolocusGird,
    pdfArray: IRegionPDF[],
    region: GeolocusMultiPolygonObject,
  ) {
    const bbox = region.getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(this._context.getGirdSize() / ratio)
    const sdfArray = pdfArray.filter((pdf) => pdf.type !== 4)
    const gdfArray = pdfArray.filter((pdf) => pdf.type === 4)
    const pdfGirdArray: IRegionResultPdfGird[] = []
    const rowCount = Math.ceil(dy / girdSize)
    const colCount = Math.ceil(dx / girdSize)

    sdfArray.forEach((pdf) => {
      const gird = Gird.getGirdWithFilter(rowCount, colCount, (row, col) => {
        const x = xStart + col * girdSize
        const y = yStart + row * girdSize
        return mask[row][col] && RegionPDF.computePDF(pdf, [x, y])
      })
      const tempPdfGird: IRegionResultPdfGird = {
        type: 'gdf',
        gird,
        bbox: null,
      }
      pdfGirdArray.push(tempPdfGird)
    })
    gdfArray.forEach((pdf) => {
      const tempPdfGird: IRegionResultPdfGird = {
        type: 'sdf',
        gird: RegionPDF.computePDF(pdf),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        bbox: pdf.sdf.girdRegion!.getBBox(),
      }
      pdfGirdArray.push(tempPdfGird)
    })

    return pdfGirdArray
  }

  private extractRegionGird(
    gird: GeolocusGird,
    originBBox: GeolocusBBox,
    targetBBox: GeolocusBBox,
  ): GeolocusGird {
    const girdRow = gird.length
    const girdCol = gird[0].length

    const originXStart = originBBox[0]
    const originXEnd = originBBox[2]
    const originDx = originXEnd - originXStart
    const originYStart = originBBox[1]
    const originYEnd = originBBox[3]
    const originDy = originYEnd - originYStart

    const targetXStart = targetBBox[0]
    const targetXEnd = targetBBox[2]
    const targetDx = targetXEnd - targetXStart
    const targetYStart = targetBBox[1]
    const targetYEnd = targetBBox[3]
    const targetDy = targetYEnd - targetYStart
    const ratio = targetDy / targetDx
    const girdSize = targetDx / Math.sqrt(this._context.getGirdSize() / ratio)

    const resultGird = Gird.getGirdWithFilter(
      Math.ceil(targetDy / girdSize),
      Math.ceil(targetDx / girdSize),
      (row, col) => {
        const x = originXStart + col * girdSize
        const y = originYStart + row * girdSize
        const transformX = Math.floor(((x - originXStart) / originDx) * girdCol)
        const transformY = Math.floor(((y - originYStart) / originDy) * girdRow)
        return gird[transformY][transformX]
      },
    )

    return resultGird
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
        regionMask: null,
      }
      this._resultMap.set(currentUUID, result)

      const { resultPdf, resultRegion } = this.getRegionAndPdf(
        currentUUID,
        result,
        context,
      )
      result.pdf = resultPdf
      result.region = resultRegion
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.regionMask = result.region!.getMaskWithinBBox(
        context.getGirdSize(),
      )
      result.resultGird = this.getRegionGrid(currentUUID)
      const { coord } = this.getCoordOfMaximum(currentUUID)
      result.coord = coord

      const object = context.getObjectByUUID(currentUUID) as GeolocusObject
      const center = object.getCenter()
      object.setFuzzy(false)
      object.translate(center, coord)
    }

    return uuidArray
  }

  getRegionGrid(uuid: string) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const mask = result.regionMask as GeolocusGird
    const resultGird: GeolocusGird = Gird.getGirdWithFillValue(
      mask.length,
      mask[0].length,
      1,
    )

    const region = result.region as GeolocusMultiPolygonObject
    const bbox = region.getBBox()
    result.pdfGird = this.getPdfGird(mask, result.pdf, region)
    result.pdfGird.forEach((pdfGird) => {
      const tempGird = pdfGird.gird as GeolocusGird
      const transformGird =
        pdfGird.type === 'gdf'
          ? tempGird
          : this.extractRegionGird(tempGird, pdfGird.bbox as GeolocusBBox, bbox)

      Gird.forEach(resultGird, (_, row, col) => {
        resultGird[row][col] *= transformGird[row][col]
      })
    })

    const transformGird = Gird.normalize(resultGird)
    return transformGird
  }

  getCoordOfMaximum(uuid: string) {
    const result = this.getResultByUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const resultGrid = result.resultGird as GeolocusGird

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
    let min = GEO_MAX_VALUE
    let coord: Position2 = [0, 0]
    Gird.forEach(resultGrid, (value, row, col) => {
      const x = xStart + col * girdSize
      const y = yStart + row * girdSize
      if (Compare.GE(resultGrid[row][col], max)) {
        max = value
        coord = [x, y]
      }
      if (Compare.LE(resultGrid[row][col], min)) min = value
    })
    return { coord, range: [min, max] as EuclideanDistanceRange }
  }
}
