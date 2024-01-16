import {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'

export { GeoJson } from './geoJSON'
export { GeolocusGeometryFactory, GeolocusGeometryMeta } from './geometry'
export {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'
export { Transformation } from './transformation'
export {
  GeolocusBBox,
  GeolocusGeometry,
  GeolocusObject,
  GeolocusObjectStatus,
} from './type'
export {
  computeGeolocusObjectMaskGrid,
  createEmptyGeolocusObject,
  createPolygonFromBBox,
} from './util'
export const geolocusObjectMapping = {
  Point: GeolocusPointObject,
  LineString: GeolocusLineStringObject,
  Polygon: GeolocusPolygonObject,
  MultiPoint: GeolocusMultiPointObject,
  MultiLineString: GeolocusMultiLineStringObject,
  MultiPolygon: GeolocusMultiPolygonObject,
}
