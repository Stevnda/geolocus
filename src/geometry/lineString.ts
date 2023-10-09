import { Position2 } from '../type'
import { BBoxGeometry } from './bbox'
import { IGeolocusGeometry } from './geometry'

export class LineStringGeometry implements IGeolocusGeometry {
  private _type: 'LineString'
  private _vertex: Position2[]
  private _bbox: BBoxGeometry

  constructor(vertex: Position2[]) {
    this._type = 'LineString'
    this._vertex = vertex
    this._bbox = BBoxGeometry.getBBoxFromPoints(vertex)
  }

  getType(): 'LineString' {
    return this._type
  }

  getVertex(): Position2[] {
    return this._vertex
  }

  getBBox(): BBoxGeometry {
    return this._bbox
  }

  clone(): LineStringGeometry {
    return new LineStringGeometry(this._vertex)
  }
}
