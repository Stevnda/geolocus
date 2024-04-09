import jsts from '@geolocus/jsts'
import { GeoJSON } from 'geojson'
import { TGeolocusGeometry } from './object.type'

export class GeoJson {
  private static reader = new jsts.io.GeoJSONReader()
  private static writer = new jsts.io.GeoJSONWriter()

  static parse(geojson: GeoJSON): TGeolocusGeometry {
    const geometry = this.reader.read(geojson)
    return geometry
  }

  static stringify(geometry: TGeolocusGeometry): GeoJSON {
    const json = this.writer.write(geometry)
    return json as GeoJSON
  }
}
