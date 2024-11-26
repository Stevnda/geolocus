import { GeolocusContext, ObjectMapAction, Role, RouteAction } from '@/context'
import { PDFInput, GeoTripleResult, PdfGrid, RegionHandlerResult, RegionResult } from './region.type'
import { RegionPDF } from './pdf'
import {
  computeGeolocusObjectMaskGrid,
  GeolocusBBox,
  GeolocusGeometry,
  GeolocusGeometryAction,
  GeolocusObject,
  JTSGeometryFactory,
  Position2,
} from '@/object'
import {
  Topology,
  EuclideanDistanceRange,
  GeoTriple,
  Distance,
  RelationAction,
  Direction,
  EuclideanDistance,
  GeoRelation,
  TopologyRelation,
  Layout,
} from '@/relation'
import { Compare, GEO_MAX_VALUE, GeolocusGrid, Grid, MAGIC_NUMBER, MathUtil, Vector2 } from '@/util'
import { AStar, Graph } from './aStart'

export class GeoTripleHandler {
  private static intersection = (object0: GeolocusObject, object1: GeolocusObject) => {
    let intersection = Topology.intersection(object0.getGeometry(), object1.getGeometry())
    if (!intersection) {
      intersection = new GeolocusGeometry('Polygon', JTSGeometryFactory.empty('Polygon'))
    }
    return new GeolocusObject(intersection)
  }

  private static disjointHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
    const distance = Distance.normalize(relation.distance as EuclideanDistance | EuclideanDistanceRange)
    const meanDistanceDelta = role.getDistanceDelta() * distance.mean
    const minDistance = distance.min - meanDistanceDelta * 1.5 >= 0 ? distance.min - meanDistanceDelta * 1.5 : 0
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3
    const infinity =
      relation.distance instanceof Array &&
      Compare.EQ(relation.distance[0], 0) &&
      Compare.EQ(relation.distance[1], role.getContext().getMaxDistance() + Math.PI)

    const geometry = <GeolocusGeometry>Topology.bufferOfRange(origin.getGeometry(), [minDistance, maxDistance])
    const region = new GeolocusObject(geometry, { infinity })
    const pdf: PDFInput = {
      type: 'distance',
      origin,
      gdf: {
        distance: distance.mean,
        distanceDelta,
      },
      sdf: {},
      spread: {},
      weight: relation.weight,
    }

    return { region, pdf }
  }

  private static containHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const context = role.getContext()
    const geometry = origin.getGeometry()
    const region = new GeolocusObject(geometry) as GeolocusObject
    const pdf: PDFInput = {
      type: 'sdf',
      origin,
      gdf: {},
      sdf: {
        gridRegion: region,
        gridSum: context.getGridSum(),
      },
      spread: {},
      weight: relation.weight || 1,
    }
    return { region, pdf }
  }

  private static withinHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    return this.containHandler(origin, relation, role)
  }

  private static alongHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const context = role.getContext()
    const originGeometry = origin.getGeometry()
    const objectType = originGeometry.getType()

    // 取外接矩形对角线的二十分之一和语义关系近的平均值两者的最大值, 作为缓冲区距离
    const N = role.getSemanticDistanceMap().N
    const bbox = originGeometry.getBBox()
    const dx = bbox[2] - bbox[0]
    const dy = bbox[3] - bbox[1]
    const distance = Math.max((N[0] + N[1]) / 2, Math.sqrt(dx * dx + dy * dy) / 40)

    let geometry: GeolocusGeometry | null = null
    if (objectType === 'Point' || objectType === 'LineString') {
      geometry = <GeolocusGeometry>Topology.bufferOfDistance(originGeometry, distance)
    } else {
      const range = relation.range
      const outside = <GeolocusGeometry>Topology.bufferOfDistance(originGeometry, distance)
      const inside = Topology.bufferOfDistance(originGeometry, -distance)
      if (inside === null) {
        geometry = {
          both: outside,
          outside: <GeolocusGeometry>Topology.difference(outside, originGeometry),
          inside: originGeometry,
        }[range]
      } else {
        geometry = {
          both: <GeolocusGeometry>Topology.difference(outside, inside),
          outside: <GeolocusGeometry>Topology.difference(outside, originGeometry),
          inside: <GeolocusGeometry>Topology.difference(originGeometry, inside),
        }[range]
      }
    }

    const region = new GeolocusObject(geometry)
    const pdf: PDFInput = {
      type: 'sdf',
      origin,
      gdf: {},
      sdf: {
        gridRegion: region,
        gridSum: context.getGridSum(),
      },
      spread: {},
      weight: relation.weight || 1,
    }

    return { region, pdf }
  }

  private static intersectHandler = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const originGeometry = origin.getGeometry()

    // 取外接矩形对角线的二十分之一和语义关系近的平均值两者的最大值, 作为缓冲区距离
    const N = role.getSemanticDistanceMap().N
    const bbox = originGeometry.getBBox()
    const dx = bbox[2] - bbox[0]
    const dy = bbox[3] - bbox[1]
    const distance = Math.max((N[0] + N[1]) / 2, Math.sqrt(dx * dx + dy * dy) / 40)
    relation.distance = distance
    const region = this.distanceHandler(origin, relation, role)

    return this.containHandler(region, relation, role)
  }

  private static directionHandler = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const direction = <number>relation.direction
    const directionDelta = role.getDirectionDelta()
    const geometry = Direction.computeRegion(origin.getGeometry(), direction, relation.range)
    const region = new GeolocusObject(geometry)
    const pdf: PDFInput = {
      type: 'angle',
      origin,
      gdf: {
        azimuth: direction,
        azimuthDelta: directionDelta,
      },
      sdf: {},
      spread: {},
      weight: relation.weight,
    }

    return { region, pdf }
  }

  private static distanceHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
    // 统一转换为 polygon
    origin.setGeometry(<GeolocusGeometry>Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER))

    // 相离关系直接返回 origin
    if (relation.topology === 'disjoint') return origin

    let distanceRegion: GeolocusObject
    const geometry = origin.getGeometry()
    // 如果 distance=0, origin 不变
    if (relation.distance === 0) {
      distanceRegion = origin
    } // 如果 distance 为数值, origin 放缩
    else if (typeof relation.distance === 'number') {
      const temp = Topology.bufferOfDistance(geometry, relation.distance)
      distanceRegion = new GeolocusObject(temp || new GeolocusGeometry('Polygon', JTSGeometryFactory.empty('Polygon')))
    } // 如果 distance 为数值范围, 根据 disjoint 算出目标区域, 然后 topology 强制为 contain
    else {
      const { region } = this.disjointHandler(origin, relation, role)
      relation.topology = 'contain'
      relation.direction = undefined
      distanceRegion = region
    }

    return distanceRegion
  }

  private static topologyHandleMap: Record<
    TopologyRelation,
    (origin: GeolocusObject, relation: GeoRelation, role: Role) => RegionHandlerResult
  > = {
    disjoint: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
      const res = this.disjointHandler(origin, relation, role)
      return res
    },
    contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
      const res = this.containHandler(origin, relation, role)
      return res
    },
    within: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
      return this.withinHandler(origin, relation, role)
    },
    intersect: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
      const topology = this.intersectHandler(origin, relation, role)
      return topology
    },
    along: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
      const topology = this.alongHandler(origin, relation, role)
      return topology
    },
  }

  private static topologyAndDistance = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const distanceRegion = this.distanceHandler(origin, relation, role)
    const topology = relation.topology
    const result = this.topologyHandleMap[topology](distanceRegion, relation, role)

    return result
  }

  private static all = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const distanceRegion = this.distanceHandler(origin, relation, role)
    const topology = relation.topology
    const td = this.topologyHandleMap[topology](distanceRegion, relation, role)
    if (relation.direction == null) {
      return td
    } else {
      const direction = this.directionHandler(distanceRegion, relation, role)
      const intersection = this.intersection(td.region, direction.region)
      intersection.setInfinity(td.region.getInfinity())

      td.region = intersection
      td.pdf.sdf.gridRegion = intersection
      td.pdf.type = td.pdf.type === 'sdf' ? 'sdf' : 'distanceAndAngle'
      td.pdf.gdf = {
        ...td.pdf.gdf,
        azimuth: direction.pdf.gdf.azimuth,
        azimuthDelta: direction.pdf.gdf.azimuthDelta,
      }

      return td
    }
  }

  static getRegionHandler(relation: GeoRelation) {
    if (relation.direction != null) {
      return this.all
    } else {
      return this.topologyAndDistance
    }
  }
}

export class Region {
  // point object
  static computeFuzzyPointObject(uuid: string, context: GeolocusContext): RegionResult {
    // compute the order
    const route = context.getRoute()
    const computedOrderStack = RouteAction.computeObjectOrder(context, uuid, route)
    if (!computedOrderStack) {
      throw new Error('Can not compute this object or it is not necessary be computed.')
    }

    let result: RegionResult | null = null
    // compute single object by order
    while (computedOrderStack.length > 0) {
      const currentUUID = computedOrderStack.pop() as string
      const currentResult: RegionResult = {
        geoTripleList: RelationAction.getTripleListByUUID(context.getRelation(), currentUUID),
        geoTripleResultList: [],
        region: null,
        regionPdfGrid: null,
        result: null,
      }
      context.getResultMap().set(currentUUID, currentResult)
      if (currentUUID === uuid) result = currentResult

      // compute pdf and region of per geoTriple
      const geoTripleResultList = []
      for (const geoTriple of currentResult.geoTripleList) {
        const geoTripleResult = this.computePdfAndRegionOfGeoTriple(geoTriple, context)
        geoTripleResultList.push(geoTripleResult)
      }
      currentResult.geoTripleResultList = geoTripleResultList

      // compute the region of result, the intersection of all region
      let resultRegion = context.getRegionRange().getGeometry()
      for (const geoTripleResult of geoTripleResultList) {
        const tempRegion = Topology.intersection(resultRegion, <GeolocusGeometry>geoTripleResult.region?.getGeometry())
        if (!tempRegion) {
          throw new Error("Can't compute the fuzzy region, the intersection is empty.")
        }
        resultRegion = tempRegion
      }
      currentResult.region = new GeolocusObject(resultRegion)
      // compute the pdfGrid of result, the dot of all pdfGrid
      currentResult.regionPdfGrid = this.computeRegionResultPDFGrid(currentResult, context)
      // compute the coord of result, the coord of maximum of pdfGrid
      const { coord } = this.getCoordOfMaximumOfGeolocusGrid(currentResult.regionPdfGrid, currentResult.region, context)

      // update the point object
      const objectMap = context.getObjectMap()
      const object = <GeolocusObject>ObjectMapAction.getObjectByUUID(objectMap, currentUUID)
      const geometry = new GeolocusGeometry('Point', JTSGeometryFactory.point(coord))
      object.setGeometry(geometry)
      object.setStatus('precise')
      currentResult.result = object
    }

    return <RegionResult>result
  }

  private static computeRegionResultPDFGrid(result: RegionResult, context: GeolocusContext) {
    const gridSum = context.getGridSum()
    const mask = computeGeolocusObjectMaskGrid(<GeolocusObject>result?.region, gridSum)
    const resultGrid: GeolocusGrid = Grid.createGridWithValue(mask.length, mask[0].length, 1)
    const region = <GeolocusObject>result.region
    const bbox = region.getGeometry().getBBox()

    for (const geoTripleResult of result.geoTripleResultList) {
      geoTripleResult.pdfGrid = this.computePdfGrid(region, <PDFInput>geoTripleResult.pdfInput, context)
    }

    result.geoTripleResultList.forEach((geoTripleResult) => {
      const pdfGrid = <PdfGrid>geoTripleResult.pdfGrid
      const tempGrid = <GeolocusGrid>pdfGrid.grid
      const weight = pdfGrid.weight
      const transformGrid =
        pdfGrid.type === 'gdf' ? tempGrid : this.extractRegionGrid(tempGrid, <GeolocusBBox>pdfGrid.bbox, bbox, gridSum)
      Grid.forEach(resultGrid, (_, row, col) => {
        resultGrid[row][col] *= weight * transformGrid[row][col]
      })
    })

    const transformGrid = Grid.normalize(resultGrid)
    return transformGrid
  }

  private static extractRegionGrid(
    grid: GeolocusGrid,
    originBBox: GeolocusBBox,
    targetBBox: GeolocusBBox,
    gridSum: number,
  ): GeolocusGrid {
    const gridRow = grid.length
    const gridCol = grid[0].length

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
    const gridSize = targetDx / Math.sqrt(gridSum / ratio)

    const resultGrid = Grid.createGridWithFilter(
      Math.ceil(targetDy / gridSize),
      Math.ceil(targetDx / gridSize),
      (row, col) => {
        const x = originXStart + (col + 0.5) * gridSize
        const y = originYStart + (row + 0.5) * gridSize
        const transformX = Math.floor(((x - originXStart) / originDx) * (gridCol - 1))
        const transformY = Math.floor(((y - originYStart) / originDy) * (gridRow - 1))
        return grid[transformY][transformX]
      },
    )

    return resultGrid
  }

  // line object
  static computeFuzzyLineObject(uuid: string, context: GeolocusContext): RegionResult {
    const geoTripleList = RelationAction.getTripleListByUUID(context.getRelation(), uuid)
    const objectMap = context.getObjectMap()
    const result: RegionResult = {
      geoTripleList,
      geoTripleResultList: [],
      region: null,
      regionPdfGrid: null,
      result: null,
    }
    context.getResultMap().set(uuid, result)

    // preHandler fuzzy origin of tripleList
    for (const geoTriple of geoTripleList) {
      this.preHandleGeoTripleOfLineAndPolygon(geoTriple, context)
    }

    // compute pdf, region, regionPdfGrid and coord of per geoTriple together because of toward relation
    const geoTripleResultList = []
    let beforeRegion = new GeolocusObject(new GeolocusGeometry('Point', JTSGeometryFactory.empty('Point')))
    for (const geoTriple of geoTripleList) {
      const tag = geoTriple.originUUIDList == null
      // handle null origin of line, the before region of geoTriple as origin
      if (tag) {
        ObjectMapAction.addObject(objectMap, beforeRegion)
        geoTriple.originUUIDList = [beforeRegion.getUUID()]
      }
      const geoTripleResult = this.computePdfAndRegionOfGeoTriple(geoTriple, context)
      geoTripleResult.pdfGrid = this.computePdfGrid(
        <GeolocusObject>geoTripleResult.region,
        <PDFInput>geoTripleResult.pdfInput,
        context,
      )
      geoTripleResult.pdfGrid.grid = Grid.normalize(<GeolocusGrid>geoTripleResult.pdfGrid.grid)
      geoTripleResult.coord = this.getCoordOfMaximumOfGeolocusGrid(
        <GeolocusGrid>geoTripleResult.pdfGrid.grid,
        <GeolocusObject>geoTripleResult.region,
        context,
      ).coord
      geoTripleResultList.push(geoTripleResult)
      // handle null origin of line, remove the before region of geoTriple in objectMap
      if (tag) {
        ObjectMapAction.deleteObject(objectMap, beforeRegion)
      }

      beforeRegion = <GeolocusObject>geoTripleResult.region
    }
    result.geoTripleResultList = geoTripleResultList

    // compute the coord of result
    const coords: Position2[] = []
    let beforeCoord = geoTripleResultList[0].coord as Position2
    for (let i = 0; i < geoTripleResultList.length; i++) {
      const res = this.computeLineCoord(context, geoTripleResultList, geoTripleResultList[i], i, beforeCoord)
      coords.push(...(res[0] as Position2[]))
      beforeCoord = res[1]
    }

    // update the object
    const object = ObjectMapAction.getObjectByUUID(objectMap, uuid) as GeolocusObject
    const geolocusGeometry = new GeolocusGeometry('LineString', JTSGeometryFactory.lineString(coords))
    object.setGeometry(geolocusGeometry)
    object.setStatus('precise')
    result.result = object

    return result
  }

  private static computeLineCoord(
    context: GeolocusContext,
    geoTripleResultList: GeoTripleResult[],
    geoTripleResult: GeoTripleResult,
    index: number,
    beforeCoord: Position2,
  ): [Position2[], Position2] {
    geoTripleResult = geoTripleResult as GeoTripleResult
    const curRegion = <GeolocusGeometry>geoTripleResult.region?.getGeometry()
    const curPoint = new GeolocusGeometry('Point', JTSGeometryFactory.point(<Position2>geoTripleResult.coord))

    const afterResult = index === geoTripleResultList.length - 1 ? geoTripleResult : geoTripleResultList[index + 1]
    const afterRegion = <GeolocusGeometry>afterResult.region?.getGeometry()
    const afterPoint = new GeolocusGeometry('Point', JTSGeometryFactory.point(<Position2>afterResult.coord))

    const coord0 = beforeCoord
    // 根据 curPoint 和 afterPoint 计算距离 afterRegion 和 curRegion 的最近点 pointOfCurPoint 和 coordOfAfterPoint
    // 计算对应最近点距离 curPoint 和 afterPoint 的距离之和, 选择其中的较小值作为最终最近点
    const [coordOfCurPoint] = Distance.nearestPoints(afterRegion, curPoint)
    const [coordOfAfterPoint] = Distance.nearestPoints(curRegion, afterPoint)
    const pointOfCurPoint = new GeolocusGeometry('Point', JTSGeometryFactory.point(coordOfCurPoint))
    const pointOfAfterPoint = new GeolocusGeometry('Point', JTSGeometryFactory.point(coordOfAfterPoint))
    const distanceOfCurPoint =
      Distance.distance(pointOfCurPoint, curPoint) + Distance.distance(pointOfCurPoint, afterPoint)
    const distanceOfAfterPoint =
      Distance.distance(pointOfAfterPoint, curPoint) + Distance.distance(pointOfAfterPoint, afterPoint)
    let coord1 = distanceOfCurPoint < distanceOfAfterPoint ? coordOfCurPoint : coordOfAfterPoint
    // 如果选择 coordOfAfterPoint, 判断是否会绕路
    const [afterOfAfter] = Distance.nearestPoints(afterRegion, pointOfAfterPoint)
    const v1 = Vector2.sub(coordOfAfterPoint, <Position2>geoTripleResult.coord)
    const v2 = Vector2.sub(afterOfAfter, coordOfAfterPoint)
    if (Vector2.dot(v1, v2) < 0) coord1 = coordOfCurPoint

    const bbox = geoTripleResult.region?.getGeometry().getBBox() as GeolocusBBox
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const gridSize = dx / Math.sqrt(context.getGridSum() / ratio)
    const rowCount = Math.ceil(dy / gridSize)
    const colCount = Math.ceil(dx / gridSize)

    // 计算 coord0 和 coord1 在 grid 中的位置, 避免超出外接矩形范围
    const col0 = MathUtil.clamp(Math.floor((coord0[0] - xStart) / gridSize), 0, colCount - 1)
    const row0 = MathUtil.clamp(Math.floor((coord0[1] - yStart) / gridSize), 0, rowCount - 1)
    const col1 = MathUtil.clamp(Math.floor((coord1[0] - xStart) / gridSize), 0, colCount - 1)
    const row1 = MathUtil.clamp(Math.floor((coord1[1] - yStart) / gridSize), 0, rowCount - 1)

    // 栅格概率值反转, 转换为最小距离之和
    const grid = <GeolocusGrid>geoTripleResult.pdfGrid?.grid
    const gridTransform = Grid.createGridWithFilter(
      grid.length,
      grid[0].length,
      (row, col) => 1 / (grid[row][col] + 0.01),
    )

    const graph = new Graph(gridTransform, {
      diagonal: true,
    })
    const start = graph.grid[row0][col0]
    const end = graph.grid[row1][col1]
    const res: Position2[] = AStar.search(graph, start, end).map((node) => [node.x, node.y])
    res.unshift([row0, col0])

    const coordList: Position2[] = []
    for (let i = 0; i < res.length; i++) {
      const col = res[i][1]
      const row = res[i][0]
      // 栅格中心点坐标
      const x = xStart + (col + 0.5) * gridSize
      const y = yStart + (row + 0.5) * gridSize
      coordList.push([x, y])
    }

    return [coordList, coord1]
  }

  // polygon object
  static computeFuzzyPolygonObject(uuid: string, context: GeolocusContext): RegionResult {
    const geoTripleList = RelationAction.getTripleListByUUID(context.getRelation(), uuid)
    const objectMap = context.getObjectMap()
    const result: RegionResult = {
      geoTripleList,
      geoTripleResultList: [],
      region: null,
      regionPdfGrid: null,
      result: null,
    }
    context.getResultMap().set(uuid, result)

    // preHandler fuzzy origin of tripleList
    for (const geoTriple of geoTripleList) {
      this.preHandleGeoTripleOfLineAndPolygon(geoTriple, context)
    }

    // compute pdf, region, regionPdfGrid and coord of per geoTriple together
    const geoTripleResultList = []
    for (const geoTriple of geoTripleList) {
      const geoTripleResult = this.computePdfAndRegionOfGeoTriple(geoTriple, context)
      geoTripleResult.pdfGrid = this.computePdfGrid(
        <GeolocusObject>geoTripleResult.region,
        <PDFInput>geoTripleResult.pdfInput,
        context,
      )
      geoTripleResult.pdfGrid.grid = Grid.normalize(<GeolocusGrid>geoTripleResult.pdfGrid.grid)
      geoTripleResult.coord = this.getCoordOfMaximumOfGeolocusGrid(
        <GeolocusGrid>geoTripleResult.pdfGrid.grid,
        <GeolocusObject>geoTripleResult.region,
        context,
      ).coord
      geoTripleResultList.push(geoTripleResult)
    }
    result.geoTripleResultList = geoTripleResultList

    // compute the union of finite region, and then compute the intersection of union and infinity region
    let unionRegion: GeolocusGeometry | null = null
    for (const { region } of geoTripleResultList) {
      if (region?.getInfinity()) continue
      const geometry = <GeolocusGeometry>region?.getGeometry()
      if (unionRegion != null) {
        unionRegion = <GeolocusGeometry>Topology.union(unionRegion, geometry)
      } else {
        unionRegion = geometry
      }
    }
    for (const { region } of geoTripleResultList) {
      if (!region?.getInfinity()) continue
      const tempRegion = Topology.intersection(<GeolocusGeometry>unionRegion, <GeolocusGeometry>region?.getGeometry())
      if (!tempRegion) {
        throw new Error("Can't compute the fuzzy region, the intersection is empty.")
      }
      unionRegion = tempRegion
    }

    // compute concaveHull
    const bbox = <GeolocusBBox>unionRegion?.getBBox()
    const distance = Math.sqrt((bbox[2] - bbox[0]) ** 2 + (bbox[3] - bbox[1]) ** 2)
    const densifyGeometry = GeolocusGeometryAction.densify(<GeolocusGeometry>unionRegion, distance / 100)
    const resultGeometry = GeolocusGeometryAction.getConcaveHull(densifyGeometry, Math.PI)

    // update the object
    const object = ObjectMapAction.getObjectByUUID(objectMap, uuid) as GeolocusObject
    object.setGeometry(resultGeometry)
    object.setStatus('precise')
    result.result = object

    return result
  }

  private static preHandleGeoTripleOfLineAndPolygon(triple: GeoTriple, context: GeolocusContext) {
    if (triple.originUUIDList == null) return
    for (const originUUID of triple.originUUIDList) {
      const objectMap = context.getObjectMap()
      const object = <GeolocusObject>ObjectMapAction.getObjectByUUID(objectMap, originUUID)
      if (object.getStatus() === 'precise') return
      this.computeFuzzyPointObject(object.getUUID(), context)
    }
  }

  private static computePdfAndRegionOfGeoTriple(geoTriple: GeoTriple, context: GeolocusContext): GeoTripleResult {
    const result: GeoTripleResult = {
      coord: null,
      region: null,
      pdfInput: null,
      pdfGrid: null,
    }

    const relation = geoTriple.relation
    const objectMap = context.getObjectMap()
    let unionOrigin: GeolocusGeometry | null = null
    for (const originUUID of <string[]>geoTriple.originUUIDList) {
      const origin = <GeolocusObject>ObjectMapAction.getObjectByUUID(objectMap, originUUID)
      const buffer = new GeolocusObject(<GeolocusGeometry>Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER))
      if (unionOrigin != null) {
        unionOrigin = <GeolocusGeometry>Topology.union(unionOrigin, origin.getGeometry())
      } else {
        unionOrigin = buffer.getGeometry()
      }
    }
    unionOrigin =
      geoTriple.originUUIDList?.length === 1
        ? unionOrigin
        : GeolocusGeometryAction.getConvexHull(<GeolocusGeometry>unionOrigin)
    const regionHandler = GeoTripleHandler.getRegionHandler(relation)
    const { region, pdf } = regionHandler(new GeolocusObject(<GeolocusGeometry>unionOrigin), relation, geoTriple.role)
    result.pdfInput = pdf
    result.region = region

    if (relation.layout != null) Layout.computeLayout(relation.layout, geoTriple, result, context)

    // const regionList: GeolocusObject[] = []
    // const originList: GeolocusObject[] = []
    // const gridRegionList: GeolocusObject[] = []
    // for (const originUUID of <string[]>geoTriple.originUUIDList) {
    //   const origin = <GeolocusObject>ObjectMapAction.getObjectByUUID(objectMap, originUUID)
    //   const regionHandler = GeoTripleHandler.getRegionHandler(relation)
    //   const { region, pdf } = regionHandler(origin, relation, geoTriple.role)
    //   regionList.push(region)
    //   originList.push(origin)
    //   if (pdf.sdf.gridRegion != null) gridRegionList.push(pdf.sdf.gridRegion)
    //   result.pdfInput = pdf
    // }

    // let resultRegion = context.getRegionRange().getGeometry()
    // for (const region of regionList) {
    //   const tempRegion = Topology.intersection(resultRegion, region.getGeometry())
    //   if (!tempRegion) {
    //     throw new Error("Can't compute the fuzzy region, the intersection is empty.")
    //   }
    //   resultRegion = tempRegion
    // }
    // result.region = new GeolocusObject(resultRegion)

    // let resultOrigin = originList[0].getGeometry()
    // for (let i = 1; i < originList.length; i++) {
    //   const origin = originList[i]
    //   resultOrigin = <GeolocusGeometry>Topology.union(resultOrigin, origin.getGeometry())
    // }
    // resultOrigin = GeolocusGeometryAction.getConcaveHull(resultOrigin)
    // ;(<PDFInput>result.pdfInput).origin = new GeolocusObject(resultOrigin)

    // let resultGridRegion = context.getRegionRange().getGeometry()
    // for (const gridRegion of gridRegionList) {
    //   const tempRegion = Topology.intersection(resultRegion, gridRegion.getGeometry())
    //   if (!tempRegion) {
    //     throw new Error("Can't compute the fuzzy region, the intersection is empty.")
    //   }
    //   resultGridRegion = tempRegion
    // }
    // ;(<PDFInput>result.pdfInput).sdf.gridRegion = new GeolocusObject(resultGridRegion)

    return result
  }

  private static computePdfGrid(region: GeolocusObject, pdfInput: PDFInput, context: GeolocusContext) {
    const gridSum = context.getGridSum()
    const mask = computeGeolocusObjectMaskGrid(region, gridSum)

    const bbox = region.getGeometry().getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const gridSize = dx / Math.sqrt(gridSum / ratio)
    const rowCount = Math.ceil(dy / gridSize)
    const colCount = Math.ceil(dx / gridSize)

    let pdfGrid: PdfGrid
    if (pdfInput.type === 'sdf') {
      pdfGrid = {
        type: 'sdf',
        grid: RegionPDF.computePDF(pdfInput),
        bbox: region.getGeometry().getBBox(),
        weight: pdfInput.weight,
      }
    } else if (pdfInput.type === 'spread') {
      pdfGrid = {
        type: 'spread',
        grid: RegionPDF.computePDF(pdfInput),
        bbox: region.getGeometry().getBBox(),
        weight: pdfInput.weight,
      }
    } else {
      const grid = Grid.createGridWithFilter(rowCount, colCount, (row, col) => {
        const x = xStart + (col + 0.5) * gridSize
        const y = yStart + (row + 0.5) * gridSize
        return mask[row][col] && RegionPDF.computePDF(pdfInput, [x, y])
      })
      pdfGrid = {
        type: 'gdf',
        grid,
        bbox: region.getGeometry().getBBox(),
        weight: pdfInput.weight,
      }
    }

    return pdfGrid
  }

  private static getCoordOfMaximumOfGeolocusGrid(grid: GeolocusGrid, region: GeolocusObject, context: GeolocusContext) {
    const gridSum = context.getGridSum()
    const bbox = region.getGeometry().getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const ratio = dy / dx
    const gridSize = dx / Math.sqrt(gridSum / ratio)

    // 记录概率值大于 0.95 的坐标, 取平均值求得中心点, 寻找最近中心点最近的坐标
    const maxCoordList: [number, number, number, Position2[]] = [0, 0, 0, []]
    Grid.forEach(grid, (value, row, col) => {
      const x = xStart + (col + 0.5) * gridSize
      const y = yStart + (row + 0.5) * gridSize

      if (Compare.GE(value, 0.95)) {
        maxCoordList[0] += x
        maxCoordList[1] += y
        maxCoordList[2]++
        maxCoordList[3].push([x, y])
      }
    })
    const maxCoordCenter: Position2 = [
      Math.floor(maxCoordList[0] / maxCoordList[2]),
      Math.floor(maxCoordList[1] / maxCoordList[2]),
    ]
    const maxCoord = (() => {
      let minCoord: Position2 = [0, 0]
      let minDistance = GEO_MAX_VALUE
      for (const coord of maxCoordList[3]) {
        const curDistance = (coord[0] - maxCoordCenter[0]) ** 2 + (coord[1] - maxCoordCenter[1]) ** 2
        if (curDistance < minDistance) {
          minCoord = coord
          minDistance = curDistance
        }
      }

      return minCoord
    })()

    return { coord: maxCoord }
  }
}
