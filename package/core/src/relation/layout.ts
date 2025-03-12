import {
  GeolocusGeometry,
  GeolocusObject,
  JTSGeometryFactory,
  Position2,
} from '@/object'
import { MAGIC_NUMBER, Vector2 } from '@/util'
import jsts from '@geolocus/jsts'
import {
  ArrangementLayoutInit,
  CircularLayoutInit,
  GeoLayout,
  GeometryLayoutInit,
  GeoTriple,
  HexagonalLayoutInit,
  LinearLayoutInit,
  RectangularLayoutInit,
  TriangularLayoutInit,
} from './relation.type'
import { GeoTripleResult, PDFInput } from '@/region/region.type'
import { GeolocusContext, ObjectMapAction } from '@/context'
import { Topology } from './topology'

export class Layout {
  static computeLayout(
    layout: GeoLayout,
    geoTriple: GeoTriple,
    geoTripleResult: GeoTripleResult,
    context: GeolocusContext,
  ) {
    const { layout: layoutType } = layout
    if (layoutType === 'arrangement') {
      const init = <ArrangementLayoutInit>layout.init
      const result = this.computeArrangementLayout(
        layout.number,
        init,
        geoTriple,
        geoTripleResult,
        context,
      )
      const pdfInput = <PDFInput>geoTripleResult.pdfInput
      if (init.type === 'between') {
        geoTripleResult.region = <GeolocusObject>result
        pdfInput.type = 'sdf'
        pdfInput.sdf.gridRegion = <GeolocusObject>result
      } else {
        pdfInput.type = 'spread'
        pdfInput.spread.gridRegion = <GeolocusObject>geoTripleResult.region
        pdfInput.spread.gridSum = context.getGridSum()
        pdfInput.spread.spreadPointList = <GeolocusObject>result
      }
    } else if (layoutType === 'geometry') {
      const init = <GeometryLayoutInit>layout.init
      const result = this.computeGeometryLayout(
        layout.number,
        init,
        geoTripleResult,
      )
      const pdfInput = <PDFInput>geoTripleResult.pdfInput
      pdfInput.type = 'spread'
      pdfInput.spread.gridRegion = <GeolocusObject>geoTripleResult.region
      pdfInput.spread.gridSum = context.getGridSum()
      pdfInput.spread.spreadPointList = <GeolocusObject>result
    }
  }

  // arrangementLayout
  private static computeArrangementLayout(
    number: number,
    layoutInit: ArrangementLayoutInit,
    geoTriple: GeoTriple,
    geoTripleResult: GeoTripleResult,
    context: GeolocusContext,
  ): GeolocusObject {
    const { type } = layoutInit
    const objectMap = context.getObjectMap()
    if (type === 'between') {
      let resultGeometry = (<GeolocusObject>(
        geoTripleResult.region
      )).getGeometry()
      for (const originUUID of <string[]>geoTriple.originUUIDList) {
        const origin = <GeolocusObject>(
          ObjectMapAction.getObjectByUUID(objectMap, originUUID)
        )
        const buffer = new GeolocusObject(
          <GeolocusGeometry>(
            Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER)
          ),
        )
        resultGeometry = <GeolocusGeometry>(
          Topology.difference(resultGeometry, buffer.getGeometry())
        )
      }

      return new GeolocusObject(resultGeometry)
    } else if (type === 'uniform') {
      const pointList = this.generateUniformPointList(
        <GeolocusObject>geoTripleResult.region,
        number,
      )
      return new GeolocusObject(
        new GeolocusGeometry(
          'MultiPoint',
          JTSGeometryFactory.multiPoint(pointList),
        ),
      )
    } else {
      const pointList = this.generateRandomPointList(
        <GeolocusObject>geoTripleResult.region,
        number,
      )
      return new GeolocusObject(
        new GeolocusGeometry(
          'MultiPoint',
          JTSGeometryFactory.multiPoint(pointList),
        ),
      )
    }
  }

  private static generateRandomPointList(
    polygon: GeolocusObject,
    n: number,
  ): Position2[] {
    const geometry = polygon.getGeometry()
    const bbox = geometry.getBBox()
    const [minX, minY, maxX, maxY] = bbox

    const res: Position2[] = []
    for (let i = 0; i < n; i++) {
      let point: Position2 = [
        minX + Math.random() * (maxX - minX),
        minY + Math.random() * (maxY - minY),
      ]
      while (!this.isPointInPolygon(point, geometry)) {
        point = [
          minX + Math.random() * (maxX - minX),
          minY + Math.random() * (maxY - minY),
        ]
      }
      res.push(point)
    }

    return res
  }

  private static generateUniformPointList(
    polygon: GeolocusObject,
    n: number,
  ): Position2[] {
    const geometry = polygon.getGeometry()
    const area = geometry.getArea()
    const pointList: Position2[] = []
    const bbox = geometry.getBBox()
    const [minX, minY, maxX, maxY] = bbox
    const cellSize = Math.sqrt(area / n / Math.PI) * Math.SQRT2
    const grid: (Position2 | null)[][] = Array.from(
      { length: Math.ceil((maxX - minX) / cellSize) },
      () => Array(Math.ceil((maxY - minY) / cellSize)).fill(null),
    )

    const activeList: Position2[] = []
    let initialPoint: Position2 = [
      minX + 0.5 * (maxX - minX),
      minY + 0.5 * (maxY - minY),
    ]
    while (!this.isPointInPolygon(initialPoint, geometry)) {
      initialPoint = [
        minX + Math.random() * (maxX - minX),
        minY + Math.random() * (maxY - minY),
      ]
    }
    pointList.push(initialPoint)
    activeList.push(initialPoint)
    const [gx, gy] = [
      Math.floor((initialPoint[0] - minX) / cellSize),
      Math.floor((initialPoint[1] - minY) / cellSize),
    ]
    grid[gx][gy] = initialPoint

    while (activeList.length > 0 && pointList.length < n) {
      const randIndex = Math.floor(Math.random() * activeList.length)
      const point = activeList[randIndex]

      let found = false
      for (let i = 0; i < 30; i++) {
        const angle = 2 * Math.PI * Math.random()
        const radius = cellSize * Math.sqrt(2 * Math.random() + 1)
        const newPoint: Position2 = [
          point[0] + radius * Math.cos(angle),
          point[1] + radius * Math.sin(angle),
        ]
        if (!this.isPointInPolygon(newPoint, geometry)) continue

        const [gx, gy] = [
          Math.floor((newPoint[0] - minX) / cellSize),
          Math.floor((newPoint[1] - minY) / cellSize),
        ]
        if (grid[gx][gy] !== null) continue

        let isValid = true
        for (let x = gx - 1; x <= gx + 1; x++) {
          for (let y = gy - 1; y <= gy + 1; y++) {
            if (
              x >= 0 &&
              x < grid.length &&
              y >= 0 &&
              y < grid[0].length &&
              grid[x][y] !== null
            ) {
              if (
                Vector2.distanceTo(<Position2>grid[x][y], newPoint) >= cellSize
              )
                continue
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

  private static isPointInPolygon(
    coord: Position2,
    geometry: GeolocusGeometry,
  ): boolean {
    const point = JTSGeometryFactory.point(coord)
    const result =
      jsts.operation.distance.DistanceOp.distance(
        geometry.getGeometry(),
        point,
      ) === 0
    return result
  }

  // Geometric Layout
  private static computeGeometryLayout(
    number: number,
    layoutInit: GeometryLayoutInit,
    geoTripleResult: GeoTripleResult,
  ): GeolocusObject | GeolocusObject[] {
    const { type } = layoutInit
    const center = <Position2>geoTripleResult.region?.getGeometry().getCenter()
    if (number === 1)
      return new GeolocusObject(
        new GeolocusGeometry('Point', JTSGeometryFactory.point(center)),
      )
    let pointList
    if (type === 'line') {
      const tempInit = layoutInit.init as LinearLayoutInit
      pointList = this.generateLinearPointList(center, number, tempInit.gap)
    } else if (type === 'circle') {
      const tempInit = layoutInit.init as CircularLayoutInit
      pointList = this.generateCircularPointList(
        center,
        number,
        tempInit.type,
        tempInit.gap,
      )
    } else if (type === 'triangle') {
      const tempInit = layoutInit.init as TriangularLayoutInit
      pointList = this.generateTriangularPointList(
        center,
        number,
        tempInit.type,
        tempInit.gap,
        tempInit.angle,
      )
    } else if (type === 'rectangle') {
      const tempInit = layoutInit.init as RectangularLayoutInit
      pointList = this.generateRectangularPointList(
        center,
        number,
        tempInit.type,
        tempInit.gap,
        tempInit.ratio,
      )
    } else {
      const tempInit = layoutInit.init as HexagonalLayoutInit
      pointList = this.generateHexagonalPointList(
        center,
        number,
        tempInit.type,
        tempInit.gap,
      )
    }
    return new GeolocusObject(
      new GeolocusGeometry(
        'MultiPoint',
        JTSGeometryFactory.multiPoint(pointList),
      ),
    )
  }

  private static generateLinearPointList(
    center: Position2,
    num: number,
    gap: number,
  ): Position2[] {
    const pointList = []
    const [cx, cy] = center

    const startOffset = -((num - 1) / 2) * gap
    for (let i = 0; i < num; i++) {
      const offset = startOffset + i * gap
      const coord: Position2 = [cx + offset, cy]
      pointList.push(coord)
    }

    return pointList
  }

  private static generateCircularPointList(
    center: Position2,
    num: number,
    type: 'solid' | 'hollow',
    gap: number,
  ): Position2[] {
    if (type === 'solid') {
      const pointList = []
      let rings = 0
      let pointsGenerated = 0

      while (pointsGenerated < num) {
        if (rings === 0) {
          pointList.push(center)
          pointsGenerated++
        } else {
          const radius = rings * gap
          const pointsInRing = Math.floor((2 * Math.PI * radius) / gap)
          const angleStep = (2 * Math.PI) / pointsInRing

          for (let i = 0; i < pointsInRing; i++) {
            if (pointsGenerated >= num) break
            const angle = i * angleStep
            const x = center[0] + radius * Math.cos(angle)
            const y = center[1] + radius * Math.sin(angle)
            pointList.push(<Position2>[x, y])
            pointsGenerated++
          }
        }
        rings++
      }

      return pointList
    } else {
      const pointList = []
      const radius = (num * gap) / (2 * Math.PI)

      for (let i = 0; i < num; i++) {
        const angle = (i * 2 * Math.PI) / num
        const x = center[0] + radius * Math.cos(angle)
        const y = center[1] + radius * Math.sin(angle)
        pointList.push(<Position2>[x, y])
      }
      console.log(gap, pointList)
      return pointList
    }
  }

  private static generateTriangularPointList(
    center: Position2,
    num: number,
    type: 'solid' | 'hollow' | 'vFormation',
    gap: number,
    angle: number,
  ): Position2[] {
    const pointList = []
    const halfAngle = angle / 2

    let level = 0
    let curNum = 0
    while (curNum < num) {
      if (level === 0) {
        pointList.push(<Position2>[0, 0])
        level++
        curNum++
        continue
      }
      level++
      const sideLength = level * gap
      const dx = sideLength * Math.sin(halfAngle)
      const dy = sideLength * Math.cos(halfAngle)
      const bottomSideLength = 2 * dx
      let bottomNum = Math.floor(bottomSideLength / gap) + 1
      if (
        type === 'vFormation' ||
        (type === 'hollow' && curNum + bottomNum < num)
      ) {
        bottomNum = 2
      }
      for (let i = 0; i < bottomNum; i++) {
        if (i === bottomNum - 1) {
          pointList.push(<Position2>[dx, -dy])
        } else {
          pointList.push(<Position2>[-dx + i * gap, -dy])
        }
        curNum++
        if (curNum >= num) break
      }
    }

    const height = level * gap * Math.cos(halfAngle)
    const offset: Position2 = [center[0], center[1] + height / 2]
    const res = pointList.map((value) => Vector2.add(value, offset))

    return res
  }

  private static generateRectangularPointList(
    center: Position2,
    num: number,
    type: 'solid' | 'hollow',
    gap: number,
    ratio: [number, number],
  ): Position2[] {
    const pointList = []
    if (type === 'hollow') {
      if (num <= 3) {
        return this.generateLinearPointList(center, num, gap)
      }
      const halfPerimeter = (num * gap) / 2
      const lengthUnit = Math.ceil(halfPerimeter / (ratio[0] + ratio[1]))
      const width = lengthUnit * ratio[0]
      const height = lengthUnit * ratio[1]
      const tl: Position2 = [center[0] - width / 2, center[1] + height / 2]
      const tr: Position2 = [center[0] + width / 2, center[1] + height / 2]
      const br: Position2 = [center[0] + width / 2, center[1] - height / 2]
      const bl: Position2 = [center[0] - width / 2, center[1] - height / 2]
      let curNum = 4
      do {
        pointList.push(tl)
        for (let i = 1; i * gap <= width; i++) {
          if (curNum >= num) break
          const coord: Position2 = [tl[0] + i * lengthUnit, tl[1]]
          pointList.push(coord)
          curNum++
        }
        pointList.push(tr)
        for (let i = 0; i * gap <= height; i++) {
          if (curNum >= num) break
          const coord: Position2 = [tr[0], tl[1] - i * lengthUnit]
          pointList.push(coord)
          curNum++
        }
        pointList.push(br)
        for (let i = 0; i * gap <= width; i++) {
          if (curNum >= num) break
          const coord: Position2 = [br[0] + i * lengthUnit, tl[1]]
          pointList.push(coord)
          curNum++
        }
        pointList.push(bl)
        for (let i = 0; i * gap <= height; i++) {
          if (curNum >= num) break
          const coord: Position2 = [bl[0] + i * lengthUnit, bl[1]]
          pointList.push(coord)
          curNum++
        }
      } while (curNum < num)
    } else {
      const widthNum = Math.floor((num / (ratio[0] + ratio[1])) * ratio[0])
      const heightNum = Math.ceil(num / widthNum)
      const width = widthNum * gap
      const height = heightNum * gap
      const start = [center[0] - width / 2, center[1] + height / 2]
      for (let i = 0; i < heightNum; i++) {
        for (let j = 0; j < widthNum; j++) {
          const coord: Position2 = [start[0] + j * gap, start[1] - i * gap]
          pointList.push(coord)
        }
      }
    }

    return pointList.slice(0, num)
  }

  private static generateHexagonalPointList(
    center: Position2,
    num: number,
    type: 'solid' | 'hollow',
    gap: number,
  ): Position2[] {
    const pointList = []
    if (type === 'solid') {
      let layer = 0

      while (pointList.length < num) {
        if (layer === 0) {
          pointList.push(center)
        } else {
          const sideNum = layer - 1
          const angleStep = (2 * Math.PI) / 6
          const curPointList = []
          for (let i = 0; i < 6; i++) {
            const angle = i * angleStep
            const x = center[0] + layer * gap * Math.cos(angle)
            const y = center[1] + layer * gap * Math.sin(angle)
            curPointList.push([x, y] as Position2)
          }
          for (let i = 0; i < 6; i++) {
            let offset
            if (i !== 5) {
              offset = Vector2.sub(curPointList[i + 1], curPointList[i])
            } else {
              offset = Vector2.sub(curPointList[0], curPointList[5])
            }
            for (let j = 0; j <= sideNum; j++) {
              const temp = j / (sideNum + 1)
              const coord = Vector2.add(curPointList[i], [
                offset[0] * temp,
                offset[1] * temp,
              ])
              pointList.push(coord)
            }
          }
        }
        layer += 1
      }
    } else {
      const sideNum = Math.ceil((num - 6) / 6)
      const sideLen = Math.ceil((num * gap) / 6)
      const angleStep = (2 * Math.PI) / 6
      const curPointList = []
      for (let i = 0; i < 6; i++) {
        const angle = i * angleStep
        const x = center[0] + sideLen * Math.cos(angle)
        const y = center[1] + sideLen * Math.sin(angle)
        curPointList.push([x, y] as Position2)
      }
      const offsetList = []
      for (let i = 0; i < 6; i++) {
        let offset
        if (i !== 5) {
          offset = Vector2.sub(curPointList[i + 1], curPointList[i])
        } else {
          offset = Vector2.sub(curPointList[0], curPointList[5])
        }
        offsetList.push(offset)
      }
      for (let j = 0; j <= sideNum; j++) {
        for (let i = 0; i < 6; i++) {
          const temp = j / (sideNum + 1)
          const coord = Vector2.add(curPointList[i], [
            offsetList[i][0] * temp,
            offsetList[i][1] * temp,
          ])
          pointList.push(coord)
        }
      }
    }

    return pointList.slice(0, num)
  }
}
