import { GEO_MAX_VALUE } from '../math'
import { GeolocusPolygonObject } from './object'

export {
  GeolocusLineStringObject,
  GeolocusObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'

export const MaxBBoxPolygon = GeolocusPolygonObject.fromBBox([
  -GEO_MAX_VALUE,
  -GEO_MAX_VALUE,
  GEO_MAX_VALUE,
  GEO_MAX_VALUE,
])
export type GeolocusBBox = [number, number, number, number]
