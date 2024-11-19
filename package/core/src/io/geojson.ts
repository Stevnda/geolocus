import { GeolocusGeometry, GeolocusGeometryType } from '@/object'
import jsts from '@geolocus/jsts'
import { GeoJSON } from 'geojson'

export class IO {
  private static reader = new jsts.io.GeoJSONReader()
  private static writer = new jsts.io.GeoJSONWriter()

  static geoJSONToGeom(geojson: GeoJSON): GeolocusGeometry {
    const type = geojson.type
    if (['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(geojson.type)) {
      throw Error()
    }
    const geometry = this.reader.read(geojson)
    return new GeolocusGeometry(type as GeolocusGeometryType, geometry)
  }

  static geomToGeoJSON(geometry: GeolocusGeometry): GeoJSON {
    const json = this.writer.write(geometry.getGeometry())
    return json as GeoJSON
  }
}
