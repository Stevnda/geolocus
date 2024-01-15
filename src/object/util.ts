import { Position2 } from '@/context'
import { GeolocusGird, Gird } from '@/util'
import { GeolocusGeometryFactory } from './geometry'
import { GeolocusPolygonObject } from './object'
import { GeolocusBBox, GeolocusObject, IGeolocusObjectInit } from './type'

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
      const result = tempPoint.distance(geometry) === 0
      return +result
    },
  )

  return mask
}
