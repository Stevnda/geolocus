import { GeolocusGeometry, GeolocusObject, JTSGeometryFactory, Position2 } from '@/object'
import { Vector2 } from '@/util'
import jsts from '@geolocus/jsts'

export class Layout {
  static isPointInPolygon(coord: Position2, geometry: GeolocusGeometry): boolean {
    const point = JTSGeometryFactory.point(coord)
    const result = jsts.operation.distance.DistanceOp.distance(geometry.getGeometry(), point) === 0
    return result
  }

  static generateRandomPointList(polygon: GeolocusObject, n: number): Position2[] {
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

  static generateUniformPointList(polygon: GeolocusObject, n: number): Position2[] {
    const geometry = polygon.getGeometry()
    const area = geometry.getArea()
    const points: Position2[] = []
    const bbox = geometry.getBBox()
    const [minX, minY, maxX, maxY] = bbox
    const cellSize = Math.sqrt(area / n / Math.PI) * Math.SQRT2
    const grid: (Position2 | null)[][] = Array.from({ length: Math.ceil((maxX - minX) / cellSize) }, () =>
      Array(Math.ceil((maxY - minY) / cellSize)).fill(null),
    )

    const activeList: Position2[] = []
    let initialPoint: Position2 = [minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY)]
    while (!this.isPointInPolygon(initialPoint, geometry)) {
      initialPoint = [minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY)]
    }
    points.push(initialPoint)
    activeList.push(initialPoint)
    const [gx, gy] = [Math.floor((initialPoint[0] - minX) / cellSize), Math.floor((initialPoint[1] - minY) / cellSize)]
    grid[gx][gy] = initialPoint

    while (activeList.length > 0 && points.length < n) {
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
        points.push(newPoint)
        activeList.push(newPoint)
        grid[gx][gy] = newPoint
        found = true
        break
      }

      if (!found) activeList.splice(randIndex, 1)
    }

    return points
  }

  //   static computeArrangementLayout(layout: ArrangementLayout): GeolocusObject | GeolocusObject[] {
  //     const { type, number } = layout.space
  //     if (type === 'between') {
  //       return layout.region
  //     } else if (type === 'uniform') {
  //       const pointList = this.generateUniformPointList(layout.region, number)
  //     }
  //   }
}
