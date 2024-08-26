import { GeolocusContext, RouteAction } from '@/context'
import {
  RegionPDFInput,
  RegionResult,
  RegionResultPdfGird,
} from './region.type'
import { RegionPDF } from './pdf.util'
import {
  computeGeolocusObjectMaskGrid,
  GeolocusBBox,
  GeolocusGeometry,
  GeolocusGeometryTransformation,
  GeolocusObject,
  JTSGeometryFactory,
  Position2,
} from '@/object'
import { RegionResultHandler } from './regionHandler.util'
import {
  Topology,
  EuclideanDistanceRange,
  GeoTriple,
  GeoRelation,
} from '@/relation'
import { Compare, GEO_MAX_VALUE, GeolocusGird, Gird, Vector2 } from '@/util'
import { RelationAction } from '@/relation/relation.action'
import { LineRelation } from '..'

export class Region {
  private static computeRegionAndPdf(
    tripleSet: Set<GeoTriple>,
    context: GeolocusContext,
  ) {
    const resultPdf: Set<RegionPDFInput> = new Set()

    // compute region and pdf
    const regionArray: GeolocusObject[] = []
    for (const triple of tripleSet) {
      const relation = triple.relation
      const origin = context.getObjectByObjectUUID(
        triple.origin,
      ) as GeolocusObject
      const regionHandler = RegionResultHandler.getRegionHandler(relation)
      const { region, pdf } = regionHandler(origin, relation, triple.role)
      resultPdf.add(pdf)
      regionArray.push(region)
    }

    // compute the intersection of all region
    let resultRegion = new GeolocusGeometry(
      'Polygon',
      JTSGeometryFactory.bbox([
        -GEO_MAX_VALUE,
        -GEO_MAX_VALUE,
        GEO_MAX_VALUE,
        GEO_MAX_VALUE,
      ]),
    )
    for (const currentRegion of regionArray) {
      const tempRegion = Topology.intersection(
        resultRegion,
        currentRegion.getGeometry(),
      )
      if (!tempRegion) {
        throw new Error("Can't compute the fuzzy region.")
      }
      resultRegion = tempRegion
    }

    return { resultPdf, resultRegion }
  }

  private static computePdfGird(
    mask: GeolocusGird,
    pdfArray: Set<RegionPDFInput>,
    region: GeolocusObject,
    gridSizeSum: number,
  ) {
    const bbox = region.getGeometry().getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(gridSizeSum / ratio)
    const pdfGirdArray: RegionResultPdfGird[] = []
    const rowCount = Math.ceil(dy / girdSize)
    const colCount = Math.ceil(dx / girdSize)
    pdfArray.forEach((pdf) => {
      if (pdf.type === 'sdf') {
        pdfGirdArray.push({
          type: 'sdf',
          gird: RegionPDF.computePDF(pdf),
          bbox: pdf.sdf.girdRegion!.getGeometry().getBBox(),
          weight: pdf.weight,
        })
      } else {
        const gird = Gird.createGirdWithFilter(
          rowCount,
          colCount,
          (row, col) => {
            const x = xStart + (col + 0.5) * girdSize
            const y = yStart + (row + 0.5) * girdSize
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

  private static extractRegionGird(
    gird: GeolocusGird,
    originBBox: GeolocusBBox,
    targetBBox: GeolocusBBox,
    gridSizeSum: number,
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
    const girdSize = targetDx / Math.sqrt(gridSizeSum / ratio)

    const resultGird = Gird.createGirdWithFilter(
      Math.ceil(targetDy / girdSize),
      Math.ceil(targetDx / girdSize),
      (row, col) => {
        const x = originXStart + (col + 0.5) * girdSize
        const y = originYStart + (row + 0.5) * girdSize
        const transformX = Math.floor(((x - originXStart) / originDx) * girdCol)
        const transformY = Math.floor(((y - originYStart) / originDy) * girdRow)
        return gird[transformY][transformX]
      },
    )

    return resultGird
  }

  private static computeRegionGrid(result: RegionResult, gridSizeSum: number) {
    const mask = result.regionMask as GeolocusGird
    const resultGird: GeolocusGird = Gird.createGirdWithValue(
      mask.length,
      mask[0].length,
      1,
    )

    const region = result.region as GeolocusObject
    const bbox = region.getGeometry().getBBox()
    result.pdfGird = this.computePdfGird(mask, result.pdf, region, gridSizeSum)
    result.pdfGird.forEach((pdfGird) => {
      const tempGird = pdfGird.gird as GeolocusGird
      const weight = pdfGird.weight
      const transformGird =
        pdfGird.type === 'gdf'
          ? tempGird
          : this.extractRegionGird(
              tempGird,
              pdfGird.bbox as GeolocusBBox,
              bbox,
              gridSizeSum,
            )
      Gird.forEach(resultGird, (_, row, col) => {
        resultGird[row][col] *= weight * transformGird[row][col]
      })
    })

    const transformGird = Gird.normalize(resultGird)
    return transformGird
  }

  private static getCoordOfMaximum(result: RegionResult, gridSizeSum: number) {
    const resultGrid = result.resultGird as GeolocusGird
    const region = result.region as GeolocusObject
    const bbox = region.getGeometry().getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(gridSizeSum / ratio)

    let max = -GEO_MAX_VALUE
    let min = GEO_MAX_VALUE
    let coord: Position2 = [0, 0]
    Gird.forEach(resultGrid, (value, row, col) => {
      const x = xStart + (col + 0.5) * girdSize
      const y = yStart + (row + 0.5) * girdSize
      if (Compare.GE(resultGrid[row][col], max)) {
        max = value
        coord = [x, y]
      }
      if (Compare.LE(resultGrid[row][col], min)) min = value
    })
    return { coord, range: [min, max] as EuclideanDistanceRange }
  }

  static computeFuzzyPointObject(uuid: string, context: GeolocusContext) {
    // compute the order
    const route = context.getRoute()
    const computedOrderStack = RouteAction.computeObjectOrder(
      context,
      uuid,
      route.getInNodeList(),
    )
    if (!computedOrderStack) {
      throw new Error(
        'Can not compute this object or it is not necessary be computed.',
      )
    }

    // compute single object by order
    const uuidArray = computedOrderStack.slice()
    while (computedOrderStack.length > 0) {
      const currentUUID = computedOrderStack.pop() as string
      const result: RegionResult = {
        region: null,
        pdf: new Set(),
        coord: null,
        pdfGird: [],
        resultGird: null,
        regionMask: null,
      }
      context.getResultMap().set(currentUUID, result)

      // compute pdf and region
      console.timeLog('default', 'compute region and pdf start')
      const { resultPdf, resultRegion } = this.computeRegionAndPdf(
        context.getRelation().getTripleListOfObject(uuid) as Set<GeoTriple>,
        context,
      )
      result.pdf = resultPdf
      result.region = new GeolocusObject(resultRegion)
      console.timeLog('default', 'compute region and pdf end')

      // compute grid
      console.timeLog('default', 'compute gird start')
      result.regionMask = computeGeolocusObjectMaskGrid(
        result.region!,
        context.getGridSize(),
      )
      result.resultGird = this.computeRegionGrid(result, context.getGridSize())
      const { coord } = this.getCoordOfMaximum(result, context.getGridSize())
      result.coord = coord
      console.timeLog('default', 'compute gird end')

      // update the object
      const object = context.getObjectByObjectUUID(
        currentUUID,
      ) as GeolocusObject
      const center = object.getGeometry().getCenter()
      const offset = Vector2.sub(coord, center)
      const translatedGeometry = GeolocusGeometryTransformation.translate(
        object.getGeometry(),
        ...offset,
      )
      object.setGeometry(translatedGeometry)
      object.setStatus('precise')
    }

    return uuidArray
  }

  // export interface LineRelation {
  //   role: string
  //   name: string
  //   type?: GeolocusGeometryType
  //   coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
  //   relation: UserGeolocusRelation
  // }

  // export interface UserGeolocusRelation {
  //   topology?: TopologyRelation
  //   direction?: AbsoluteDirection | RelativeDirection
  //   distance?: EuclideanDistance | EuclideanDistanceRange
  //   range?: ComputeRegionRange
  //   semantic?: string
  // }

  private static handleUnknownLineOriginObject(
    lineRelation: LineRelation,
    context: GeolocusContext,
  ) {
    let { name, type, coord } = lineRelation
    if (coord == null || type == null) {
      const placePlugin = context.getPlugin('place')
      // NOTE place is always has result
      const { type: resultType, coord: resultCoord } = placePlugin(name)
      type = resultType
      coord = resultCoord
    }
    const jstGeometry = JTSGeometryFactory.create(type, coord)
    const geolocusGeometry = new GeolocusGeometry(type, jstGeometry)
    const object = new GeolocusObject(geolocusGeometry, name)
    return object
  }

  private static getLineOriginObject(
    lineRelation: LineRelation,
    context: GeolocusContext,
  ) {
    const uuid = context.getObjectUUIDByPlaceName(lineRelation.name)
    // the name is not in geolocus
    if (!uuid) return this.handleUnknownLineOriginObject(lineRelation, context)
    // the name is in geolocus
    const object = context.getObjectByObjectUUID(uuid) as GeolocusObject
    if (object.getStatus() === 'precise') return object
    try {
      this.computeFuzzyPointObject(uuid, context)
      return object
    } catch (error) {
      return this.handleUnknownLineOriginObject(lineRelation, context)
    }
  }

  private static computeRegionOnLine(
    relationList: LineRelation[],
    context: GeolocusContext,
  ): {
    object: GeolocusObject
    result: RegionResult | null
  }[] {
    const res: {
      object: GeolocusObject
      result: RegionResult | null
    }[] = []
    for (const lineRelation of relationList) {
      const role = context.getRoleMap().get(lineRelation.role)
      if (!role) {
        throw Error('the role is not existed')
      }
      // NOTE different topology use different method
      // const mode = lineRelation.mode

      const originObject = this.getLineOriginObject(lineRelation, context)
      if (lineRelation.relation) {
        const relation: GeoRelation = RelationAction.transform(
          lineRelation.relation,
          role,
        )

        const result: RegionResult = {
          region: null,
          pdf: new Set(),
          coord: null,
          pdfGird: [],
          resultGird: null,
          regionMask: null,
        }
        // compute pdf and region
        const regionHandler = RegionResultHandler.getRegionHandler(relation)
        const { region, pdf } = regionHandler(originObject, relation, role)
        result.pdf = new Set([pdf])
        result.region = region

        // compute grid
        result.regionMask = computeGeolocusObjectMaskGrid(
          result.region!,
          context.getGridSize(),
        )
        result.resultGird = this.computeRegionGrid(
          result,
          context.getGridSize(),
        )
        const { coord } = this.getCoordOfMaximum(result, context.getGridSize())
        result.coord = coord

        // create the object
        const jstGeometry = JTSGeometryFactory.point(coord)
        const geolocusGeometry = new GeolocusGeometry('Point', jstGeometry)
        const targetObject = new GeolocusObject(
          geolocusGeometry,
          lineRelation.name + '-tempTarget',
        )
        res.push({
          object: targetObject,
          result,
        })
      } else {
        res.push({
          object: originObject,
          result: null,
        })
      }
    }

    return res
  }

  static computeFuzzyLineObject(
    lineName: string,
    relationList: LineRelation[],
    context: GeolocusContext,
  ) {
    const regionList = this.computeRegionOnLine(relationList, context)
    const coords = regionList.map((region) =>
      region.object.getGeometry().getCenter(),
    )
    const jstGeometry = JTSGeometryFactory.lineString(coords)
    const geolocusGeometry = new GeolocusGeometry('LineString', jstGeometry)
    const result = new GeolocusObject(geolocusGeometry, lineName)

    return result
  }
}
