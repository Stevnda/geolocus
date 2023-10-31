import * as turf from '@turf/turf'
import { GeolocusBBox, Position2 } from '../type'
import { Point, LineString, Polygon, Feature } from 'geojson'

export type GeolocusPointGeoJSON = Feature<Point>
export type GeolocusLineStringGeoJSON = Feature<LineString>
export type GeolocusPolygonGeoJSON = Feature<Polygon>
export type GeolocusGeoJSON =
  | GeolocusPointGeoJSON
  | GeolocusLineStringGeoJSON
  | GeolocusPolygonGeoJSON

export class GeoJSON {
  static point = (position: Position2): GeolocusPointGeoJSON => {
    return turf.point(position)
  }

  static lineString = (position: Position2[]): GeolocusLineStringGeoJSON => {
    return turf.lineString(position)
  }

  static polygon = (position: Position2[][]): GeolocusPolygonGeoJSON => {
    return turf.polygon(position)
  }

  static bboxPolygon = (position: GeolocusBBox): GeolocusPolygonGeoJSON => {
    const leftDown = [position[0], position[1]]
    const rightDown = [position[2], position[1]]
    const rightUp = [position[2], position[3]]
    const leftUp = [position[0], position[3]]

    return turf.polygon([[leftDown, rightDown, rightUp, leftUp, leftDown]])
  }

  static bbox = (object: GeolocusGeoJSON): GeolocusBBox => {
    return turf.bbox(object) as GeolocusBBox
  }
}
