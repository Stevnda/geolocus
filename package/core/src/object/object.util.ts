import { GeolocusGird, Gird } from '@/util'
import { GeolocusObject } from './object.actor'
import { JTSGeometryFactory } from './geometry.action'
import jsts from '@geolocus/jsts'
import { GeolocusGeometry } from './geometry.actor'
import { GeoJSON } from 'geojson'
import { GeolocusGeometryType } from './object.type'

export const computeGeolocusObjectMaskGrid = (
  object: GeolocusObject,
  girdNum: number,
): GeolocusGird => {
  const bbox = object.getGeometry().getBBox()
  const xStart = bbox[0]
  const xEnd = bbox[2]
  const dx = xEnd - xStart
  const yStart = bbox[1]
  const yEnd = bbox[3]
  const dy = yEnd - yStart
  const ratio = dy / dx
  const girdSize = dx / Math.sqrt(girdNum / ratio)
  const geometry = object.getGeometry()

  const mask = Gird.createGirdWithFilter(
    Math.ceil(dy / girdSize),
    Math.ceil(dx / girdSize),
    (row, col) => {
      const tempPoint = JTSGeometryFactory.point([
        xStart + col * girdSize,
        yStart + row * girdSize,
      ])
      const result =
        jsts.operation.distance.DistanceOp.distance(
          geometry.getGeometry(),
          tempPoint,
        ) === 0
      return +result
    },
  )

  return mask
}

export class GeoJson {
  private static reader = new jsts.io.GeoJSONReader()
  private static writer = new jsts.io.GeoJSONWriter()

  static parse(geojson: GeoJSON): GeolocusGeometry {
    const type = geojson.type
    if (
      [
        'Point',
        'LineString',
        'Polygon',
        'MultiPoint',
        'MultiLineString',
        'MultiPolygon',
      ].includes(geojson.type)
    ) {
      throw Error()
    }
    const geometry = this.reader.read(geojson)
    return new GeolocusGeometry(type as GeolocusGeometryType, geometry)
  }

  static stringify(geometry: GeolocusGeometry): GeoJSON {
    const json = this.writer.write(geometry.getGeometry())
    return json as GeoJSON
  }
}
