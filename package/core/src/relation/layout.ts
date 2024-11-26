import { GeolocusGeometry, GeolocusObject, JTSGeometryFactory, Position2 } from '@/object'
import { MAGIC_NUMBER, Vector2 } from '@/util'
import jsts from '@geolocus/jsts'
import { ArrangementLayout, GeoLayout } from './layout.type'
import { GeoTriple } from './relation.type'
import { GeoTripleResult, PDFInput } from '@/region/region.type'
import { GeolocusContext, ObjectMapAction } from '@/context'
import { Topology } from './topology'

export class Layout {
  private static isPointInPolygon(coord: Position2, geometry: GeolocusGeometry): boolean {
    const point = JTSGeometryFactory.point(coord)
    const result = jsts.operation.distance.DistanceOp.distance(geometry.getGeometry(), point) === 0
    return result
  }

  private static generateRandomPointList(polygon: GeolocusObject, n: number): Position2[] {
    const geometry = polygon.getGeometry()
    const bbox = geometry.getBBox()
    const [minX, minY, maxX, maxY] = bbox

    const res: Position2[] = []
    for (let i = 0; i < n; i++) {
      let point: Position2 = [minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY)]
      while (!this.isPointInPolygon(point, geometry)) {
        point = [minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY)]
      }
      res.push(point)
    }

    return res
  }

  private static generateUniformPointList(polygon: GeolocusObject, n: number): Position2[] {
    const geometry = polygon.getGeometry()
    const area = geometry.getArea()
    const pointList: Position2[] = []
    const bbox = geometry.getBBox()
    const [minX, minY, maxX, maxY] = bbox
    const cellSize = Math.sqrt(area / n / Math.PI) * Math.SQRT2
    const grid: (Position2 | null)[][] = Array.from({ length: Math.ceil((maxX - minX) / cellSize) }, () =>
      Array(Math.ceil((maxY - minY) / cellSize)).fill(null),
    )

    const activeList: Position2[] = []
    let initialPoint: Position2 = [minX + 0.5 * (maxX - minX), minY + 0.5 * (maxY - minY)]
    while (!this.isPointInPolygon(initialPoint, geometry)) {
      initialPoint = [minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY)]
    }
    pointList.push(initialPoint)
    activeList.push(initialPoint)
    const [gx, gy] = [Math.floor((initialPoint[0] - minX) / cellSize), Math.floor((initialPoint[1] - minY) / cellSize)]
    grid[gx][gy] = initialPoint

    while (activeList.length > 0 && pointList.length < n) {
      const randIndex = Math.floor(Math.random() * activeList.length)
      const point = activeList[randIndex]

      let found = false
      for (let i = 0; i < 30; i++) {
        const angle = 2 * Math.PI * Math.random()
        const radius = cellSize * Math.sqrt(2 * Math.random() + 1)
        const newPoint: Position2 = [point[0] + radius * Math.cos(angle), point[1] + radius * Math.sin(angle)]
        if (!this.isPointInPolygon(newPoint, geometry)) continue

        const [gx, gy] = [Math.floor((newPoint[0] - minX) / cellSize), Math.floor((newPoint[1] - minY) / cellSize)]
        if (grid[gx][gy] !== null) continue

        let isValid = true
        for (let x = gx - 1; x <= gx + 1; x++) {
          for (let y = gy - 1; y <= gy + 1; y++) {
            if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length && grid[x][y] !== null) {
              if (Vector2.distanceTo(<Position2>grid[x][y], newPoint) >= cellSize) continue
              isValid = false
              break
            }
          }
          if (!isValid) break
        }

        if (!isValid) continue
        pointList.push(newPoint)
        activeList.push(newPoint)
        grid[gx][gy] = newPoint
        found = true
        break
      }

      if (!found) activeList.splice(randIndex, 1)
    }

    return pointList
  }

  private static computeArrangementLayout(
    layout: ArrangementLayout,
    geoTriple: GeoTriple,
    geoTripleResult: GeoTripleResult,
    context: GeolocusContext,
  ): GeolocusObject {
    const { type, number } = layout
    const objectMap = context.getObjectMap()
    if (type === 'between') {
      let resultGeometry = (<GeolocusObject>geoTripleResult.region).getGeometry()
      for (const originUUID of <string[]>geoTriple.originUUIDList) {
        const origin = <GeolocusObject>ObjectMapAction.getObjectByUUID(objectMap, originUUID)
        const buffer = new GeolocusObject(
          <GeolocusGeometry>Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER),
        )
        resultGeometry = <GeolocusGeometry>Topology.difference(resultGeometry, buffer.getGeometry())
      }

      return new GeolocusObject(resultGeometry)
    } else if (type === 'uniform') {
      const pointList = this.generateUniformPointList(<GeolocusObject>geoTripleResult.region, number)
      return new GeolocusObject(new GeolocusGeometry('MultiPoint', JTSGeometryFactory.multiPoint(pointList)))
    } else {
      const pointList = this.generateRandomPointList(<GeolocusObject>geoTripleResult.region, number)
      return new GeolocusObject(new GeolocusGeometry('MultiPoint', JTSGeometryFactory.multiPoint(pointList)))
    }
  }

  static computeLayout(
    layout: GeoLayout,
    geoTriple: GeoTriple,
    geoTripleResult: GeoTripleResult,
    context: GeolocusContext,
  ) {
    const { type } = layout
    if (['uniform', 'random', 'between'].includes(type)) {
      const result = this.computeArrangementLayout(<ArrangementLayout>layout, geoTriple, geoTripleResult, context)
      const pdfInput = <PDFInput>geoTripleResult.pdfInput
      if (type === 'between') {
        geoTripleResult.region = result
        pdfInput.type = 'sdf'
        pdfInput.sdf.gridRegion = result
      } else {
        pdfInput.type = 'spread'
        pdfInput.spread.gridRegion = <GeolocusObject>geoTripleResult.region
        pdfInput.spread.gridSum = context.getGridSum()
        pdfInput.spread.spreadPointList = result
      }
    }
  }
}
