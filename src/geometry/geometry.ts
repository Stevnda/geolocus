import { BBoxGeometry, GeolocusGeometry } from '.'
import { Position2 } from '../type'

export interface IGeolocusGeometry {
  getType(): 'Point' | 'LineString' | 'Polygon' | 'BBox'
  getVertex(): Position2[] | Position2
  getBBox(): BBoxGeometry
  clone(): GeolocusGeometry
}
