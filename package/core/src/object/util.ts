import { Position2 } from '@/context'
import { GeolocusGird, Gird } from '@/util'
import jsts from '@geolocus/jsts'
import { GeolocusGeometryFactory } from './geometry'
import {
  GeolocusLineStringObject,
  GeolocusMultiLineStringObject,
  GeolocusMultiPointObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from './object'
import {
  GeolocusBBox,
  GeolocusGeometryType,
  GeolocusObject,
  IGeolocusObjectInit,
} from './type'

interface ICreateEmptyGeolocusObject {
  (type: 'Point'): GeolocusPointObject
  (type: 'LineString'): GeolocusLineStringObject
  (type: 'Polygon'): GeolocusPolygonObject
  (type: 'MultiPoint'): GeolocusMultiPointObject
  (type: 'MultiLineString'): GeolocusMultiLineStringObject
  (type: 'MultiPolygon'): GeolocusMultiPolygonObject
}

export const createEmptyGeolocusObject = ((type: GeolocusGeometryType) => {
  const objectFactoryMap = {
    Point: GeolocusPointObject,
    LineString: GeolocusLineStringObject,
    Polygon: GeolocusPolygonObject,
    MultiPoint: GeolocusMultiPointObject,
    MultiLineString: GeolocusMultiLineStringObject,
    MultiPolygon: GeolocusMultiPolygonObject,
  }

  const Factory = objectFactoryMap[type]
  const object = new Factory([] as never, {
    geometry: GeolocusGeometryFactory.empty(type),
    bbox: [0, 0, 0, 0],
    center: [0, 0],
  })

  return object
}) as ICreateEmptyGeolocusObject

export const createPolygonFromBBox = (
  bbox: GeolocusBBox,
  option?: Omit<IGeolocusObjectInit, 'type'> & { type?: 'Polygon' },
): GeolocusPolygonObject => {
  const leftDown: Position2 = [bbox[0], bbox[1]]
  const rightDown: Position2 = [bbox[2], bbox[1]]
  const rightUp: Position2 = [bbox[2], bbox[3]]
  const leftUp: Position2 = [bbox[0], bbox[3]]

  const polygon = new GeolocusPolygonObject(
    [[leftDown, rightDown, rightUp, leftUp, leftDown]],
    option,
  )

  return polygon
}

export const computeGeolocusObjectMaskGrid = (
  object: GeolocusObject,
  girdNum: number,
): GeolocusGird => {
  const bbox = object.getBBox()
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
      const tempPoint = GeolocusGeometryFactory.point([
        xStart + col * girdSize,
        yStart + row * girdSize,
      ])
      const result =
        jsts.operation.distance.DistanceOp.distance(geometry, tempPoint) === 0
      return +result
    },
  )

  return mask
}
