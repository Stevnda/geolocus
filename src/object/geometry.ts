import * as turf from '@turf/turf'
import { Position2 } from '../type'

export type GeolocusPointGeometry = turf.Point
export type GeolocusLineStringGeometry = turf.LineString
export type GeolocusPolygonGeometry = turf.Polygon
export type GeolocusGeometry =
  | GeolocusPointGeometry
  | GeolocusLineStringGeometry
  | GeolocusPolygonGeometry

export type GeolocusBBox = [number, number, number, number]

export class Geometry {
  static point = (position: Position2): GeolocusPointGeometry => {
    return turf.point(position).geometry
  }

  static lineString = (position: Position2[]): GeolocusLineStringGeometry => {
    return turf.lineString(position).geometry
  }

  static polygon = (position: Position2[]): GeolocusPolygonGeometry => {
    return turf.polygon([position]).geometry
  }

  static bboxPolygon = (position: GeolocusBBox): GeolocusPolygonGeometry => {
    const leftDown = [position[0], position[2]]
    const rightDown = [position[1], position[2]]
    const rightUp = [position[1], position[3]]
    const leftUp = [position[0], position[3]]

    return turf.polygon([[leftDown, rightDown, rightUp, leftUp]]).geometry
  }

  static bbox = (geometry: GeolocusGeometry): GeolocusBBox => {
    return turf.bbox(geometry) as GeolocusBBox
  }
}
