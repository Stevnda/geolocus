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
export type {
  TGeolocusObjectStatus as GeolocusObjectStatus,
  TGeolocusBBox,
  TGeolocusGeometry,
  TGeolocusObject,
} from './object.type'
export { Transformation } from './transformation'
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
