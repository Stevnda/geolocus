import { GeolocusGeometryMeta, GeolocusPolygonObject } from '@/object'
import { GeolocusMultiPolygonObject } from '@/object/object'
import { GeolocusGeometry } from '@/object/type'
import {
  EuclideanDistance,
  EuclideanDistanceRange,
  GeolocusObject,
} from '@/type'

export class Topology {
  // static isEqual = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.equalsExact(originGeometry, 0.00001)
  // }

  // static isIntersect = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.intersects(originGeometry)
  // }

  // static isDisjoint = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.disjoint(originGeometry)
  // }

  // static isWithin = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.within(originGeometry)
  // }

  // static isContains = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.contains(originGeometry)
  // }

  // static isTouch = (origin: GeolocusObject, target: GeolocusObject) => {
  //   const originGeometry = origin.getGeometry()
  //   const targetGeometry = target.getGeometry()
  //   return targetGeometry.touches(originGeometry)
  // }

  static mask = (
    object: GeolocusPolygonObject,
    mask: GeolocusPolygonObject,
  ) => {
    const objectGeometry = object.getGeometry()
    const maskGeometry = mask.getGeometry()
    const maskResult = objectGeometry.difference(maskGeometry)

    const type = maskResult.getGeometryType()
    const bbox = GeolocusGeometryMeta.getBBox(maskResult)
    const center = GeolocusGeometryMeta.getCenter(maskResult)
    if (type === 'Polygon') {
      const polygon = new GeolocusPolygonObject([[[0, 0]]], {
        type,
        bbox,
        center,
        context: object.getContext(),
        geometry: maskResult,
      })
      return polygon
    } else {
      const multiPolygon = new GeolocusMultiPolygonObject([[[[0, 0]]]], {
        type: 'MultiPolygon',
        bbox,
        center,
        context: object.getContext(),
        geometry: maskResult,
      })
      return multiPolygon
    }
  }

  static intersection = (
    polygon0: GeolocusPolygonObject | GeolocusMultiPolygonObject,
    polygon1: GeolocusPolygonObject | GeolocusMultiPolygonObject,
  ) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const intersection = geometry0.intersection(geometry1)

    const type = intersection.getGeometryType()
    if (intersection.isEmpty()) {
      return null
    } else if (type === 'Polygon') {
      const bbox = GeolocusGeometryMeta.getBBox(intersection)
      const center = GeolocusGeometryMeta.getCenter(intersection)
      const polygon = new GeolocusPolygonObject([[[0, 0]]], {
        type,
        bbox,
        center,
        context: polygon0.getContext(),
        geometry: intersection,
      })
      return polygon
    } else {
      const bbox = GeolocusGeometryMeta.getBBox(intersection)
      const center = GeolocusGeometryMeta.getCenter(intersection)
      const multiPolygon = new GeolocusMultiPolygonObject([[[[0, 0]]]], {
        type: 'MultiPolygon',
        bbox,
        center,
        context: polygon0.getContext(),
        geometry: intersection,
      })
      return multiPolygon
    }
  }

  static union = (
    polygon0: GeolocusPolygonObject | GeolocusMultiPolygonObject,
    polygon1: GeolocusPolygonObject | GeolocusMultiPolygonObject,
  ) => {
    const geometry0 = polygon0.getGeometry()
    const geometry1 = polygon1.getGeometry()
    const union = geometry0.union(geometry1)

    const type = union.getGeometryType()
    const bbox = GeolocusGeometryMeta.getBBox(union)
    const center = GeolocusGeometryMeta.getCenter(union)
    if (type === 'Polygon') {
      const polygon = new GeolocusPolygonObject([[[0, 0]]], {
        type,
        bbox,
        center,
        context: polygon0.getContext(),
        geometry: union,
      })
      return polygon
    } else {
      const multiPolygon = new GeolocusMultiPolygonObject([[[[0, 0]]]], {
        type: 'MultiPolygon',
        bbox,
        center,
        context: polygon0.getContext(),
        geometry: union,
      })
      return multiPolygon
    }
  }

  private static buffer = (
    geometry: GeolocusGeometry,
    distance: EuclideanDistance,
  ) => {
    const buffer = geometry.buffer(distance)
    return buffer
  }

  static bufferOfDistance = (
    object: GeolocusObject,
    distance: EuclideanDistance,
  ) => {
    const geometry = object.getGeometry()
    const buffer = this.buffer(geometry, distance)

    const bbox = GeolocusGeometryMeta.getBBox(buffer)
    const center = GeolocusGeometryMeta.getCenter(buffer)
    const polygon = new GeolocusPolygonObject([[[0, 0]]], {
      type: 'Polygon',
      bbox,
      center,
      context: object.getContext(),
      geometry: buffer,
    })
    return polygon
  }

  static bufferOfRange = (
    object: GeolocusObject,
    range: EuclideanDistanceRange,
  ) => {
    let min = Math.min(...range)
    const max = Math.max(...range)
    const geometry = object.getGeometry()
    let result: null | GeolocusPolygonObject = null

    let count = 0
    while (count <= 3) {
      const buffer0 = this.buffer(geometry, min)
      const buffer1 = this.buffer(geometry, max)
      const difference = buffer1.difference(buffer0)
      if (!difference.isEmpty()) {
        const bbox = GeolocusGeometryMeta.getBBox(difference)
        const center = GeolocusGeometryMeta.getCenter(difference)
        result = new GeolocusPolygonObject([[[0, 0]]], {
          type: 'Polygon',
          bbox,
          center,
          context: object.getContext(),
          geometry: difference,
        })
        break
      }
      min /= 2
      count += 1
    }

    if (!result) {
      result = this.bufferOfDistance(object, max)
    }

    return result
  }
}
