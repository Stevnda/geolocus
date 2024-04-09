import { TGeolocusContext, TPosition2 } from '@/context'
import {
  GeolocusPolygonObject,
  TGeolocusBBox,
  TGeolocusObject,
  Transformation,
  createPolygonFromBBox,
} from '@/object'
import { GEO_MAX_VALUE } from '@/util'
import {
  TAbsoluteDirection,
  TIsInsideTag,
  TRelativeDirection,
} from './relation.type'
import { Topology } from './topology'

export class Direction {
  // radian
  static azimuth(vector: TPosition2): number {
    const angle =
      (Math.PI / 2 - Math.atan2(vector[1], vector[0]) + 2 * Math.PI) %
      (2 * Math.PI)
    return angle
  }

  static computeRegion = (
    object: TGeolocusObject,
    direction: TAbsoluteDirection | TRelativeDirection,
    tag: TIsInsideTag,
    context: TGeolocusContext,
  ) => {
    const AbsoluteDirectionMap = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    if (AbsoluteDirectionMap.includes(direction)) {
      const region = this.computeAbsoluteDirection(object, direction, tag)
      return region
    } else {
      const region = this.computeRelativeDirection(
        object,
        direction,
        tag,
        context,
      )
      return region
    }
  }

  private static computeAbsoluteDirection(
    object: TGeolocusObject,
    direction: string,
    tag: TIsInsideTag,
  ) {
    const n = (source: TPosition2, target: TGeolocusBBox) => {
      target[1] = source[1]
    }
    const s = (source: TPosition2, target: TGeolocusBBox) => {
      target[3] = source[1]
    }
    const e = (source: TPosition2, target: TGeolocusBBox) => {
      target[0] = source[0]
    }
    const w = (source: TPosition2, target: TGeolocusBBox) => {
      target[2] = source[0]
    }
    const fnMap = new Map([
      ['N', n],
      ['S', s],
      ['E', e],
      ['W', w],
    ])

    const center = object.getCenter()
    const target: TGeolocusBBox = [
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

  private static computeRelativeDirection(
    object: TGeolocusObject,
    direction: string,
    tag: TIsInsideTag,
    context: TGeolocusContext,
  ) {
    const directionTransform = direction
      .replace('F', 'N')
      .replace('B', 'S')
      .replace('R', 'E')
      .replace('L', 'W')
    const temp = this.computeAbsoluteDirection(object, directionTransform, tag)
    const rotate = Transformation.rotateAroundCoord(
      temp,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      context.getOrientation(),
      object.getCenter(),
    ) as GeolocusPolygonObject
    return rotate
  }
}
