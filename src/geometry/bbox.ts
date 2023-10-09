import { Position2 } from '../type'
import { IGeolocusGeometry } from './geometry'

export class BBoxGeometry implements IGeolocusGeometry {
  private _type: 'BBox'
  private _vertex: [Position2, Position2]

  constructor(min: Position2, max: Position2) {
    this._type = 'BBox'
    this._vertex = [min, max]
  }

  getType(): 'BBox' {
    return this._type
  }

  getVertex(): [Position2, Position2] {
    return this._vertex
  }

  getBBox(): BBoxGeometry {
    return this
  }

  clone(): BBoxGeometry {
    return new BBoxGeometry(...this._vertex)
  }

  static getBBoxFromPoints = (points: Position2[]): BBoxGeometry => {
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    for (let index = 0; index < points.length; index++) {
      const point = points[index]
      if (point[0] < minX) {
        minX = point[0]
      }
      if (point[0] > maxX) {
        maxX = point[0]
      }
      if (point[1] < minY) {
        minY = point[1]
      }
      if (point[1] > maxY) {
        maxY = point[1]
      }
    }

    return new BBoxGeometry([minX, minY], [maxX, maxY])
  }
}
