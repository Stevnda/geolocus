/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext, Position2 } from '@/context'
import {
  GeolocusBBox,
  GeolocusMultiPolygonObject,
  GeolocusObject,
  GeolocusPolygonObject,
  Transformation,
  computeGeolocusObjectMaskGrid,
  createPolygonFromBBox,
  geolocusObjectMapping,
} from '@/object'
import { EuclideanDistanceRange, Topology } from '@/relation'
import { Compare, GEO_MAX_VALUE, GeolocusGird, Gird, Vector2 } from '@/util'
import { RegionResultHandler } from './handler'
import { RegionPDF } from './pdf'
import {
  IGeoTriple,
  IRegionPDF,
  IRegionRegion,
  IRegionResult,
  IRegionResultPdfGird,
  RegionStrategy,
} from './type'
export class Region {
  // the uuid of resultMap is the same as geolocusObject
  private _resultMap: Map<string, IRegionResult>
  private _context: GeolocusContext
  private _regionHandlerMap = {
    0: () => {
      throw new Error('The geoRelation is null.')
    },
    1: RegionResultHandler.topology,
    3: RegionResultHandler.direction,
    7: RegionResultHandler.distance,
    4: RegionResultHandler.topologyAndDirection,
    8: RegionResultHandler.topologyAndDistance,
    10: RegionResultHandler.directionAndDistance,
    11: RegionResultHandler.all,
  }

  constructor(context: GeolocusContext) {
    this._resultMap = new Map()
    this._context = context
  }

  getRegionResultByObjectUUID(uuid: string) {
    return this._resultMap.get(uuid)
  }

  getPdfOfTripleByRelationUUID(uuid: string) {
    let result: IRegionPDF | undefined
    this._resultMap.forEach((map) => {
      map.pdf.get(uuid) && (result = map.pdf.get(uuid))
    })
    return result
  }

  computeFuzzyObject(uuid: string, strategy: RegionStrategy) {
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
        region: null,
        pdf: new Map(),
        coord: null,
        pdfGird: [],
        resultGird: null,
        regionMask: null,
      }
      this._resultMap.set(currentUUID, result)

      console.timeLog('default', 'compute region and pdf start')
      const { resultPdf, resultRegion } = this.computeRegionAndPdf(
        currentUUID,
        context,
        strategy,
      )
      result.pdf = resultPdf
      result.region = resultRegion
      console.timeLog('default', 'compute region and pdf end')

      console.timeLog('default', 'compute gird start')
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.regionMask = computeGeolocusObjectMaskGrid(
        result.region!,
        context.getResultGirdNum(),
      )
      result.resultGird = this.computeRegionGrid(currentUUID, strategy)
      const { coord } = this.getCoordOfMaximum(currentUUID)
      result.coord = coord
      console.timeLog('default', 'compute gird end')

      const object = context.getObjectByObjectUUID(
        currentUUID,
      ) as GeolocusObject
      const center = object.getCenter()
      const offset = Vector2.sub(coord, center)
      const translatedObject = Transformation.translate(object, ...offset)
      const type = translatedObject.getType()
      const ObjectFactory = geolocusObjectMapping[type]
      // eslint-disable-next-line no-new
      new ObjectFactory([0, 0] as any, {
        type: translatedObject.getType() as any,
        bbox: translatedObject.getBBox(),
        center: translatedObject.getCenter(),
        context: translatedObject.getContext(),
        geometry: translatedObject.getGeometry(),
        name: translatedObject.getName(),
        status: 'computed',
        uuid: translatedObject.getUUID(),
      })
    }

    return uuidArray
  }

  private computeRegionAndPdf(
    uuid: string,
    context: GeolocusContext,
    strategy: RegionStrategy,
  ) {
    const relation = context.getRelation()
    const tripleMap = relation.getRelationMapOfObjectByObjectUUID(uuid) as Map<
      string,
      IGeoTriple
    >
    const resultPdf: Map<string, IRegionPDF> = new Map()

    const unboundedRegionArray: IRegionRegion[] = []
    const boundedRegionArray: IRegionRegion[] = []
    for (const [tripleUUID, triple] of tripleMap) {
      const relation = triple.relation
      const origin = context.getObjectByObjectUUID(
        triple.origin,
      ) as GeolocusObject
      const target = context.getObjectByObjectUUID(
        triple.target,
      ) as GeolocusObject
      const topologyTag = relation.topology ? 1 : 0
      const directionTag = relation.direction ? 3 : 0
      const distanceTag = relation.distance ? 7 : 0
      const tag = (topologyTag +
        directionTag +
        distanceTag) as keyof typeof this._regionHandlerMap
      const { region, pdf, boundless } = this._regionHandlerMap[tag](
        origin,
        relation,
        target,
      )
      resultPdf.set(tripleUUID, pdf)
      boundless
        ? unboundedRegionArray.push(region)
        : boundedRegionArray.push(region)
    }

    // BUG 万一 boundedRegionArray 为空就错了
    let resultRegion: IRegionRegion =
      strategy.region === 'intersection'
        ? createPolygonFromBBox([
            -GEO_MAX_VALUE,
            -GEO_MAX_VALUE,
            GEO_MAX_VALUE,
            GEO_MAX_VALUE,
          ])
        : (boundedRegionArray.shift() as IRegionRegion)
    for (const currentRegion of boundedRegionArray) {
      const tempRegion = (
        strategy.region === 'intersection'
          ? Topology.intersection(resultRegion, currentRegion)
          : Topology.union(resultRegion, currentRegion)
      ) as IRegionRegion
      if (!tempRegion) {
        throw new Error("Can't compute the fuzzy region.")
      }
      resultRegion = tempRegion
    }
    for (const currentRegion of unboundedRegionArray) {
      const tempRegion = (
        strategy.region === 'intersection'
          ? Topology.intersection(resultRegion, currentRegion)
          : Topology.union(resultRegion, currentRegion)
      ) as IRegionRegion
      if (!tempRegion) {
        throw new Error("Can't compute the fuzzy region.")
      }
      resultRegion = tempRegion
    }

    return { resultPdf, resultRegion }
  }

  private computePdfGird(
    mask: GeolocusGird,
    pdfArray: Map<string, IRegionPDF>,
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
    const girdSize = dx / Math.sqrt(this._context.getResultGirdNum() / ratio)
    const pdfGirdArray: IRegionResultPdfGird[] = []
    const rowCount = Math.ceil(dy / girdSize)
    const colCount = Math.ceil(dx / girdSize)

    pdfArray.forEach((pdf) => {
      if (pdf.type === 'sdf') {
        pdfGirdArray.push({
          type: 'sdf',
          gird: RegionPDF.computePDF(pdf),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          bbox: pdf.sdf.girdRegion!.getBBox(),
          weight: pdf.weight,
        })
      } else {
        const gird = Gird.createGirdWithFilter(
          rowCount,
          colCount,
          (row, col) => {
            const x = xStart + col * girdSize
            const y = yStart + row * girdSize
            return mask[row][col] && RegionPDF.computePDF(pdf, [x, y])
          },
        )
        pdfGirdArray.push({
          type: 'gdf',
          gird,
          bbox: null,
          weight: pdf.weight,
        })
      }
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
    const girdSize =
      targetDx / Math.sqrt(this._context.getResultGirdNum() / ratio)

    const resultGird = Gird.createGirdWithFilter(
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

  computeRegionGrid(uuid: string, strategy: RegionStrategy) {
    const result = this.getRegionResultByObjectUUID(uuid)
    if (!result) {
      throw new Error('The result of this uuid is not existed.')
    }
    const mask = result.regionMask as GeolocusGird
    const fillValue = Number(strategy.gird === 'multiply')
    const resultGird: GeolocusGird = Gird.createGirdWithValue(
      mask.length,
      mask[0].length,
      fillValue,
    )

    const region = result.region as GeolocusMultiPolygonObject
    const bbox = region.getBBox()
    result.pdfGird = this.computePdfGird(mask, result.pdf, region)
    result.pdfGird.forEach((pdfGird) => {
      const tempGird = pdfGird.gird as GeolocusGird
      const weight = pdfGird.weight
      const transformGird =
        pdfGird.type === 'gdf'
          ? tempGird
          : this.extractRegionGird(tempGird, pdfGird.bbox as GeolocusBBox, bbox)
      if (strategy.gird === 'multiply') {
        Gird.forEach(resultGird, (_, row, col) => {
          resultGird[row][col] *= weight * transformGird[row][col]
        })
      } else {
        Gird.forEach(resultGird, (_, row, col) => {
          resultGird[row][col] += weight * transformGird[row][col]
        })
      }
    })

    const transformGird = Gird.normalize(resultGird)
    return transformGird
  }

  getCoordOfMaximum(uuid: string) {
    const result = this.getRegionResultByObjectUUID(uuid)
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
    const girdSize = dx / Math.sqrt(this._context.getResultGirdNum() / ratio)

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
