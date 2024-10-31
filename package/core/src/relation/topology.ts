import { GeolocusGeometry, GeolocusGeometryType } from '@/object'
import jsts from '@geolocus/jsts'
import { EuclideanDistance, EuclideanDistanceRange } from './relation.type'

export class Topology {
  static difference = (origin: GeolocusGeometry, target: GeolocusGeometry) => {
    const originGeometry = origin.getGeometry()
    const targetGeometry = target.getGeometry()
    const result = jsts.operation.overlay.OverlayOp.difference(
      originGeometry,
      targetGeometry,
    )
    if (result.isEmpty()) return null
    const type = result.getGeometryType() as GeolocusGeometryType
    const geometry = new GeolocusGeometry(type, result)

    return geometry
  }

  static intersection = (
    polygon0: GeolocusGeometry,
    polygon1: GeolocusGeometry,
  ) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const intersection = jsts.operation.overlay.OverlayOp.intersection(
      geometry0,
      geometry1,
    )

    if (intersection.isEmpty()) return null
    const type = intersection.getGeometryType() as GeolocusGeometryType
    const geometry = new GeolocusGeometry(type, intersection)

    return geometry
  }

  static union = (polygon0: GeolocusGeometry, polygon1: GeolocusGeometry) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const union = jsts.operation.overlay.OverlayOp.union(geometry0, geometry1)

    if (union.isEmpty()) return null
    const type = union.getGeometryType() as GeolocusGeometryType
    const geometry = new GeolocusGeometry(type, union)

    return geometry
  }

  private static buffer = (
    geometry: GeolocusGeometry,
    distance: EuclideanDistance,
  ) => {
    const buffer = jsts.operation.buffer.BufferOp.bufferOp(
      geometry.getGeometry(),
      distance,
    )
    return buffer
  }

  static bufferOfDistance = (
    geometry: GeolocusGeometry,
    distance: EuclideanDistance,
  ) => {
    const buffer = this.buffer(geometry, distance)

    if (buffer.isEmpty()) return null
    const type = buffer.getGeometryType() as GeolocusGeometryType
    const res = new GeolocusGeometry(type, buffer)

    return res
  }

  static bufferOfRange = (
    geometry: GeolocusGeometry,
    range: EuclideanDistanceRange,
  ) => {
    const min = Math.min(...range)
    const max = Math.max(...range)

    const buffer0 = this.buffer(geometry, min)
    const buffer1 = this.buffer(geometry, max)
    const difference = jsts.operation.overlay.OverlayOp.difference(
      buffer1,
      buffer0,
    )

    if (difference.isEmpty()) {
      return null
    }
    const type = difference.getGeometryType() as GeolocusGeometryType
    const res = new GeolocusGeometry(type, difference)

    return res
  }
}
