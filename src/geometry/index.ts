import { BBoxGeometry } from './bbox'
import { LineStringGeometry } from './lineString'
import { PointGeometry } from './point'
import { PolygonGeometry } from './polygon'

export { BBoxGeometry } from './bbox'
export { LineStringGeometry } from './lineString'
export { PointGeometry } from './point'
export { PolygonGeometry } from './polygon'

export type GeolocusGeometry =
  | BBoxGeometry
  | LineStringGeometry
  | PolygonGeometry
  | PointGeometry
