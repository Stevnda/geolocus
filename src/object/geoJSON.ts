import * as turf from '@turf/turf'
import { GeolocusBBox, Position2 } from '../type'
import { Point, LineString, Polygon, Feature } from 'geojson'

export class GeoJSON {
  static point = (position: Position2): Feature<Point> => {
    return turf.point(position)
  }

  static lineString = (position: Position2[]): Feature<LineString> => {
    return turf.lineString(position)
  }

  static polygon = (position: Position2[][]): Feature<Polygon> => {
    return turf.polygon(position)
  }

  static bboxPolygon = (position: GeolocusBBox): Feature<Polygon> => {
    const leftDown = [position[0], position[1]]
    const rightDown = [position[2], position[1]]
    const rightUp = [position[2], position[3]]
    const leftUp = [position[0], position[3]]

    return turf.polygon([[leftDown, rightDown, rightUp, leftUp, leftDown]])
  }

  static bbox = (object: Feature): GeolocusBBox => {
    return turf.bbox(object) as GeolocusBBox
  }
}
