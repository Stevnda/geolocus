import { GeolocusBBox, Position2 } from '@/type'
import * as jsts from 'jsts'
import {
  GeolocusGeometry,
  GeolocusLineStringGeometry,
  GeolocusMultiLineStringGeometry,
  GeolocusMultiPointGeometry,
  GeolocusMultiPolygonGeometry,
  GeolocusPointGeometry,
  GeolocusPolygonGeometry,
} from './type'

export class GeolocusGeometryFactory {
  private static _geometryFactory = new jsts.geom.GeometryFactory()

  static point = (position: Position2): GeolocusPointGeometry => {
    const coord = new jsts.geom.Coordinate(...position)
    return this._geometryFactory.createPoint(coord)
  }

  static lineString = (position: Position2[]): GeolocusLineStringGeometry => {
    const coord = position.map((value) => new jsts.geom.Coordinate(...value))
    return this._geometryFactory.createLineString(coord)
  }

  static polygon = (position: Position2[][]): GeolocusPolygonGeometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createPolygon(
      lineStringArray[0],
      lineStringArray.slice(1),
    )
  }

  static multiPoint = (position: Position2[]): GeolocusMultiPointGeometry => {
    const pointArray = position.map((value) => this.point(value))
    return this._geometryFactory.createMultiPoint(pointArray)
  }

  static multiLineString = (
    position: Position2[][],
  ): GeolocusMultiLineStringGeometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createMultiLineString(lineStringArray)
  }

  static multiPolygon = (
    position: Position2[][][],
  ): GeolocusMultiPolygonGeometry => {
    const polygonArray = position.map((value) => this.polygon(value))
    return this._geometryFactory.createMultiPolygon(polygonArray)
  }
}

export class GeolocusGeometryMeta {
  static getBBox(geometry: GeolocusGeometry): GeolocusBBox {
    const envelope = geometry.getEnvelopeInternal()
    const minX = envelope.getMinX()
    const maxX = envelope.getMaxX()
    const minY = envelope.getMinY()
    const maxY = envelope.getMaxY()

    return [minX, minY, maxX, maxY]
  }

  static getCenter(geometry: GeolocusGeometry): Position2 {
    const center = geometry.getCentroid().getCoordinate()
    return [center.x, center.y]
  }
}
