import { Position2 } from '../type'
import { BBoxGeometry } from './bbox'
import { IGeolocusGeometry } from './geometry'

export class PointGeometry implements IGeolocusGeometry {
  private _type: 'Point'
  private _vertex: Position2
  private _bbox: BBoxGeometry

  constructor(position: Position2) {
    this._type = 'Point'
    this._vertex = position
    this._bbox = new BBoxGeometry(position, position)
  }

  getType(): 'Point' {
    return this._type
  }

  getVertex(): Position2 {
    return this._vertex
  }

  getBBox(): BBoxGeometry {
    return this._bbox
  }

  clone(): PointGeometry {
    return new PointGeometry(this._vertex)
  }
}
