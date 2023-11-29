import { Feature } from 'geojson'
import {
  GeolocusBBox,
  GeolocusGeometry,
  GeolocusObject,
  Position2,
} from '../type'

export interface IGeolocusObject {
  getUUID(): string
  getType(): GeolocusGeometry
  getVertex(): Position2 | Position2[] | Position2[][] | Position2[][][]
  getBBox(): GeolocusBBox
  getCenter(): Position2
  getGeoJSON(): Feature
  clone(): GeolocusObject
}
