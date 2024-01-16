import { Position2 } from '@/context'
import {
  GeolocusBBox,
  GeolocusObject,
  GeolocusPolygonObject,
  createPolygonFromBBox,
} from '@/object'
import { GEO_MAX_VALUE } from '@/util'
import { Topology } from './topology'
import { DirectionAndDistanceTag } from './type'

export class Direction {
  // radian
  static azimuth(vector: Position2): number {
    const angle =
      (Math.PI / 2 - Math.atan2(vector[1], vector[0]) + 2 * Math.PI) %
      (2 * Math.PI)
    return angle
  }

  static computeRegion = (
    object: GeolocusObject,
    direction: string,
    tag: DirectionAndDistanceTag,
  ) => {
    const lower = direction.toLowerCase()
    const AbsoluteDirectionMap = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
    if (AbsoluteDirectionMap.includes(lower)) {
      const region = this.computeAbsoluteDirection(object, lower, tag)
      return region
    } else {
      const region = this.computeAbsoluteDirection(object, lower, tag)
      return region
    }
  }

  private static computeAbsoluteDirection(
    object: GeolocusObject,
    direction: string,
    tag: DirectionAndDistanceTag,
  ) {
    const n = (source: Position2, target: GeolocusBBox) => {
      target[1] = source[1]
    }
    const s = (source: Position2, target: GeolocusBBox) => {
      target[3] = source[1]
    }
    const e = (source: Position2, target: GeolocusBBox) => {
      target[0] = source[0]
    }
    const w = (source: Position2, target: GeolocusBBox) => {
      target[2] = source[0]
    }
    const fnMap = new Map([
      ['n', n],
      ['s', s],
      ['e', e],
      ['w', w],
    ])

    const center = object.getCenter()
    const target: GeolocusBBox = [
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ]
    fnMap.forEach((fn, key) => {
      if (direction.includes(key)) {
        fn(center, target)
      }
    })
    const bboxPolygon = createPolygonFromBBox(target)

    if (tag === 'inside') {
      const intersection = Topology.intersection(bboxPolygon, object)
      return intersection as GeolocusPolygonObject
    } else if (tag === 'outside') {
      const difference = Topology.difference(bboxPolygon, object)
      return difference as GeolocusPolygonObject
    } else {
      return bboxPolygon
    }
  }
}
