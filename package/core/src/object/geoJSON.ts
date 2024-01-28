import jsts from '@geolocus/jsts'
import { GeoJSON } from 'geojson'
import { GeolocusGeometry } from './type'

export class GeoJson {
  private static reader = new jsts.io.GeoJSONReader()
  private static writer = new jsts.io.GeoJSONWriter()

  static parse(geojson: GeoJSON): GeolocusGeometry {
    const geometry = this.reader.read(geojson)
    return geometry
  }

  static stringify(geometry: GeolocusGeometry): GeoJSON {
    const json = this.writer.write(geometry)
    return json as GeoJSON
  }
}
