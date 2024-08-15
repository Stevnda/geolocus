import jsts from '@geolocus/jsts'
import { GeolocusBBox, GeolocusGeometryType, Position2 } from './object.type'

export class GeolocusGeometryFactory {
  private static _geometryFactory = new jsts.geom.GeometryFactory()

  static point = (position: Position2): jsts.geom.Geometry => {
    const coord = new jsts.geom.Coordinate(...position)
    return this._geometryFactory.createPoint(coord)
  }

  static lineString = (position: Position2[]): jsts.geom.Geometry => {
    const coord = position.map((value) => new jsts.geom.Coordinate(...value))
    return this._geometryFactory.createLineString(coord)
  }

  static polygon = (position: Position2[][]): jsts.geom.Geometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createPolygon(
      lineStringArray[0],
      lineStringArray.slice(1),
    )
  }

  static multiPoint = (position: Position2[]): jsts.geom.Geometry => {
    const pointArray = position.map((value) => this.point(value))
    return this._geometryFactory.createMultiPoint(pointArray)
  }

  static multiLineString = (position: Position2[][]): jsts.geom.Geometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createMultiLineString(lineStringArray)
  }

  static multiPolygon = (position: Position2[][][]): jsts.geom.Geometry => {
    const polygonArray = position.map((value) => this.polygon(value))
    return this._geometryFactory.createMultiPolygon(polygonArray)
  }

  static empty(type: GeolocusGeometryType) {
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
  static getBBox(geometry: jsts.geom.Geometry): GeolocusBBox {
    const envelope = geometry.getEnvelopeInternal()
    const minX = envelope.getMinX()
    const maxX = envelope.getMaxX()
    const minY = envelope.getMinY()
    const maxY = envelope.getMaxY()

    return [minX, minY, maxX, maxY]
  }

  static getCenter(geometry: jsts.geom.Geometry): Position2 {
    const center = jsts.algorithm.Centroid.getCentroid(geometry)
    return [center.x, center.y]
  }
}
