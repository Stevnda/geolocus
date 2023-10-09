import { Position2 } from '../type'
import { BBoxGeometry } from './bbox'
import { IGeolocusGeometry } from './geometry'

export class PolygonGeometry implements IGeolocusGeometry {
  private _type: 'Polygon'
  private _vertex: Position2[]
  private _bbox: BBoxGeometry

  constructor(vertex: Position2[]) {
    this._type = 'Polygon'
    this._vertex = vertex
    this._bbox = BBoxGeometry.getBBoxFromPoints(vertex)
  }

  getType(): 'Polygon' {
    return this._type
  }

  getVertex(): Position2[] {
    return this._vertex
  }

  getBBox(): BBoxGeometry {
    return this._bbox
  }

  clone(): PolygonGeometry {
    return new PolygonGeometry(this._vertex)
  }
}
