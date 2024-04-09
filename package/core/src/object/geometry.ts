import { TPosition2 } from '@/context'
import jsts from '@geolocus/jsts'
import {
  TGeolocusBBox,
  TGeolocusGeometry,
  TGeolocusGeometryName,
  TGeolocusLineStringGeometry,
  TGeolocusMultiLineStringGeometry,
  TGeolocusMultiPointGeometry,
  TGeolocusMultiPolygonGeometry,
  TGeolocusPointGeometry,
  TGeolocusPolygonGeometry,
} from './object.type'

export class GeolocusGeometryFactory {
  private static _geometryFactory = new jsts.geom.GeometryFactory()

  static point = (position: TPosition2): TGeolocusPointGeometry => {
    const coord = new jsts.geom.Coordinate(...position)
    return this._geometryFactory.createPoint(coord)
  }

  static lineString = (position: TPosition2[]): TGeolocusLineStringGeometry => {
    const coord = position.map((value) => new jsts.geom.Coordinate(...value))
    return this._geometryFactory.createLineString(coord)
  }

  static polygon = (position: TPosition2[][]): TGeolocusPolygonGeometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createPolygon(
      lineStringArray[0],
      lineStringArray.slice(1),
    )
  }

  static multiPoint = (position: TPosition2[]): TGeolocusMultiPointGeometry => {
    const pointArray = position.map((value) => this.point(value))
    return this._geometryFactory.createMultiPoint(pointArray)
  }

  static multiLineString = (
    position: TPosition2[][],
  ): TGeolocusMultiLineStringGeometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createMultiLineString(lineStringArray)
  }

  static multiPolygon = (
    position: TPosition2[][][],
  ): TGeolocusMultiPolygonGeometry => {
    const polygonArray = position.map((value) => this.polygon(value))
    return this._geometryFactory.createMultiPolygon(polygonArray)
  }

  static empty(type: TGeolocusGeometryName) {
    const map = {
      Point: this._geometryFactory.createPoint(),
      LineString: this._geometryFactory.createLineString(),
      Polygon: this._geometryFactory.createPolygon(),
      MultiPoint: this._geometryFactory.createMultiPoint(),
      MultiLineString: this._geometryFactory.createMultiLineString(),
      MultiPolygon: this._geometryFactory.createMultiPolygon(),
    }

    const factory = map[type]
    return factory
  }
}

export class GeolocusGeometryMeta {
  static getBBox(geometry: TGeolocusGeometry): TGeolocusBBox {
    const envelope = geometry.getEnvelopeInternal()
    const minX = envelope.getMinX()
    const maxX = envelope.getMaxX()
    const minY = envelope.getMinY()
    const maxY = envelope.getMaxY()

    return [minX, minY, maxX, maxY]
  }

  static getCenter(geometry: TGeolocusGeometry): TPosition2 {
    const center = jsts.algorithm.Centroid.getCentroid(geometry)
    return [center.x, center.y]
  }
}
