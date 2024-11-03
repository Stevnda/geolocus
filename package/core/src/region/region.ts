import { GeolocusContext, RouteAction } from '@/context'
import { RegionPDFInput, RegionResult, RegionResultPdfGird } from './region.type'
import { RegionPDF } from './pdf'
import {
  computeGeolocusObjectMaskGrid,
  GeolocusBBox,
  GeolocusGeometry,
  GeolocusGeometryTransformation,
  GeolocusObject,
  JTSGeometryFactory,
  Position2,
} from '@/object'
import { RegionResultHandler } from './region.handler'
import { Topology, EuclideanDistanceRange, GeoTriple, GeoRelation, Distance, RelationAction } from '@/relation'
import { Compare, GEO_MAX_VALUE, GeolocusGird, Gird, MathUtil, Vector2 } from '@/util'
import { UserGeolocusTriple } from '..'
import { Astar, Graph } from './aStart'

export class Region {
  static computeFuzzyPointObject(uuid: string, context: GeolocusContext) {
    // compute the order
    const route = context.getRoute()
    const computedOrderStack = RouteAction.computeObjectOrder(context, uuid, route.getInNodeList())
    if (!computedOrderStack) {
      throw new Error('Can not compute this object or it is not necessary be computed.')
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
      result.regionMask = computeGeolocusObjectMaskGrid(result.region, context.getGridSize())
      result.resultGird = this.computeRegionGrid(result, context.getGridSize())
      const { coord } = this.getCoordOfMaximum(result, context.getGridSize())
      result.coord = coord
      console.timeLog('default', 'compute gird end')

      // update the object
      const objectMap = context.getObjectMap()
      const object = objectMap.getObjectByUUID(currentUUID) as GeolocusObject
      const center = object.getGeometry().getCenter()
      const offset = Vector2.sub(coord, center)
      const translatedGeometry = GeolocusGeometryTransformation.translate(object.getGeometry(), ...offset)
      object.setGeometry(translatedGeometry)
      object.setStatus('precise')
    }

    return uuidArray
  }

  private static computeRegionAndPdf(tripleSet: Set<GeoTriple>, context: GeolocusContext) {
    const resultPdf: Set<RegionPDFInput> = new Set()
    const objectMap = context.getObjectMap()

    // compute region and pdf
    const regionArray: GeolocusObject[] = []
    for (const triple of tripleSet) {
      const relation = triple.relation
      const origin = objectMap.getObjectByUUID(triple.origin) as GeolocusObject
      const regionHandler = RegionResultHandler.getRegionHandler(relation)
      const { region, pdf } = regionHandler(origin, relation, triple.role)
      resultPdf.add(pdf)
      regionArray.push(region)
    }

    // compute the intersection of all region
    let resultRegion = context.getRegionRange().getGeometry()
    for (const currentRegion of regionArray) {
      const tempRegion = Topology.intersection(resultRegion, currentRegion.getGeometry())
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
          bbox: (pdf.sdf.girdRegion as GeolocusObject).getGeometry().getBBox(),
          weight: pdf.weight,
        })
      } else {
        const gird = Gird.createGirdWithFilter(rowCount, colCount, (row, col) => {
          const x = xStart + (col + 0.5) * girdSize
          const y = yStart + (row + 0.5) * girdSize
          return mask[row][col] && RegionPDF.computePDF(pdf, [x, y])
        })
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
        const transformX = Math.floor(((x - originXStart) / originDx) * (girdCol - 1))
        const transformY = Math.floor(((y - originYStart) / originDy) * (girdRow - 1))
        return gird[transformY][transformX]
      },
    )

    return resultGird
  }

  private static computeRegionGrid(result: RegionResult, gridSizeSum: number) {
    const mask = result.regionMask as GeolocusGird
    const resultGird: GeolocusGird = Gird.createGirdWithValue(mask.length, mask[0].length, 1)

    const region = result.region as GeolocusObject
    const bbox = region.getGeometry().getBBox()
    result.pdfGird = this.computePdfGird(mask, result.pdf, region, gridSizeSum)
    result.pdfGird.forEach((pdfGird) => {
      const tempGird = pdfGird.gird as GeolocusGird
      const weight = pdfGird.weight
      const transformGird =
        pdfGird.type === 'gdf'
          ? tempGird
          : this.extractRegionGird(tempGird, pdfGird.bbox as GeolocusBBox, bbox, gridSizeSum)
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

  static computeFuzzyLineObject(lineName: string, userTripleList: UserGeolocusTriple[], context: GeolocusContext) {
    const { resultList, tripleList } = this.computeRegionOnLine(userTripleList, context)
    const coords: Position2[] = []
    let beforeCoord = resultList[0].coord as Position2
    for (let i = 0; i < resultList.length; i++) {
      const res = this.computeFuzzyLineCoord(tripleList[i], resultList, resultList[i], i, beforeCoord)
      coords.push(...(res[0] as Position2[]))
      beforeCoord = res[1]
    }
    const jstGeometry = JTSGeometryFactory.lineString(coords)
    const geolocusGeometry = new GeolocusGeometry('LineString', jstGeometry)
    const lineString = new GeolocusObject(geolocusGeometry, lineName)

    return {
      lineString,
      resultList,
      tripleList,
    }
  }

  private static handleUnknownLineOriginObject(userTriple: UserGeolocusTriple, context: GeolocusContext) {
    let { name, type, coord } = userTriple.origin
    if (coord == null || type == null) {
      const placePlugin = context.getPlugin('place')
      // TODO place is always has result
      const { type: resultType, coord: resultCoord } = placePlugin(name)
      type = resultType
      coord = resultCoord
    }
    const jstGeometry = JTSGeometryFactory.create(type, coord)
    const geolocusGeometry = new GeolocusGeometry(type, jstGeometry)
    const object = new GeolocusObject(geolocusGeometry, name)
    return object
  }

  private static getLineOriginObject(userTriple: UserGeolocusTriple, context: GeolocusContext) {
    const objectMap = context.getObjectMap()
    const object = objectMap.getObjectByPlaceName(userTriple.origin.name)
    // the name is not in geolocus
    if (!object) return this.handleUnknownLineOriginObject(userTriple, context)
    // the name is in geolocus
    if (object.getStatus() === 'precise') return object
    try {
      this.computeFuzzyPointObject(object.getUUID(), context)
      return object
    } catch (error) {
      return this.handleUnknownLineOriginObject(userTriple, context)
    }
  }

  private static computeRegionOnLine(
    userTripleList: UserGeolocusTriple[],
    context: GeolocusContext,
  ): {
    tripleList: GeoTriple[]
    resultList: RegionResult[]
  } {
    const res: {
      tripleList: GeoTriple[]
      resultList: RegionResult[]
    } = {
      tripleList: [],
      resultList: [],
    }
    for (const userTriple of userTripleList) {
      const role = context.getRoleMap().get(userTriple.role)
      if (!role) throw new Error('role is not existed')

      // NOTE move to transform
      if (userTriple.relation) {
        if (userTriple.relation.topology == null) {
          userTriple.relation.topology = 'contain'
        }
      } else if (userTriple.relation == null) {
        userTriple.relation = {
          topology: 'contain',
        }
      }

      const originObject = this.getLineOriginObject(userTriple, context)
      if (userTriple.relation == null) {
        userTriple.relation = {
          distance: 0,
          topology: 'contain',
        }
      }
      const relation: GeoRelation = RelationAction.transform(userTriple.relation, role)

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
      result.regionMask = computeGeolocusObjectMaskGrid(result.region, context.getGridSize())
      result.resultGird = this.computeRegionGrid(result, context.getGridSize())

      // compute coord
      const { coord } = this.getCoordOfMaximum(result, context.getGridSize())
      result.coord = coord

      const triple: GeoTriple = {
        uuid: 'temp',
        role,
        origin: originObject.getUUID(),
        relation,
        target: 'temp',
      }
      res.resultList.push(result)
      res.tripleList.push(triple)
    }

    return res
  }

  private static computeFuzzyLineCoord(
    triple: GeoTriple,
    resultList: RegionResult[],
    result: RegionResult,
    index: number,
    beforeCoord: Position2,
  ): [Position2[], Position2] {
    result = result as RegionResult
    const context = triple.role.getContext()
    const curRegion = new GeolocusGeometry('Point', JTSGeometryFactory.point(result.coord as Position2))

    let afterRegion: GeolocusGeometry
    if (index === resultList.length - 1) {
      afterRegion = result.region?.getGeometry() as GeolocusGeometry
    } else {
      const afterResult = resultList[index + 1]
      if (afterResult instanceof GeolocusObject) {
        afterRegion = afterResult.getGeometry()
      } else {
        afterRegion = afterResult.region?.getGeometry() as GeolocusGeometry
      }
    }

    const coord0 = beforeCoord
    const [coord1] = Distance.nearestPoints(afterRegion, curRegion)

    const bbox = result.region?.getGeometry().getBBox() as GeolocusBBox
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const girdSize = dx / Math.sqrt(context.getGridSize() / ratio)
    const rowCount = Math.ceil(dy / girdSize)
    const colCount = Math.ceil(dx / girdSize)

    const col0 = MathUtil.clamp(Math.floor((coord0[0] - xStart) / girdSize), 0, colCount - 1)
    const row0 = MathUtil.clamp(Math.floor((coord0[1] - yStart) / girdSize), 0, rowCount - 1)
    const col1 = MathUtil.clamp(Math.floor((coord1[0] - xStart) / girdSize), 0, colCount - 1)
    const row1 = MathUtil.clamp(Math.floor((coord1[1] - yStart) / girdSize), 0, rowCount - 1)

    const gird = result.resultGird as GeolocusGird
    const gridTransform = Gird.createGirdWithFilter(
      gird.length,
      gird[0].length,
      (row, col) => 1 / (gird[row][col] + 0.1),
    )
    const graph = new Graph(gridTransform, {
      diagonal: true,
    })
    const start = graph.grid[row0][col0]
    const end = graph.grid[row1][col1]
    const res: Position2[] = Astar.search(graph, start, end).map((node) => [node.x, node.y])
    res.unshift([row0, col0])

    const coordList: Position2[] = []
    for (let i = 0; i < res.length; i++) {
      const col = res[i][1]
      const row = res[i][0]
      const x = xStart + (col + 0.5) * girdSize
      const y = yStart + (row + 0.5) * girdSize
      coordList.push([x, y])
    }

    return [coordList, coord1]
  }
}
