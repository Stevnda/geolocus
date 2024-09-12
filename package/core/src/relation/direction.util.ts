import {
  GeolocusBBox,
  GeolocusGeometry,
  JTSGeometryFactory,
  GeolocusGeometryTransformation,
  Position2,
} from '@/object'
import { GEO_MAX_VALUE } from '@/util'
import {
  AbsoluteDirection,
  RelativeDirection,
  ComputeRegionRange,
} from './relation.type'
import { Topology } from './topology.util'

export class Direction {
  // radian from [1,0] (N)
  // range: [0,2pi]
  static azimuth(vector: Position2): number {
    const angle =
      (Math.PI / 2 - Math.atan2(vector[1], vector[0]) + 2 * Math.PI) %
      (2 * Math.PI)
    return angle
  }

  static computeRegion = (
    geometry: GeolocusGeometry,
    direction: AbsoluteDirection | RelativeDirection,
    range: ComputeRegionRange,
    orientation = 0,
  ) => {
    const AbsoluteDirectionMap = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    if (AbsoluteDirectionMap.includes(direction)) {
      const region = this.computeAbsoluteDirection(geometry, direction, range)
      return region
    }
    const region = this.computeRelativeDirection(
      geometry,
      direction,
      range,
      orientation,
    )
    return region
  }

  private static computeAbsoluteDirection(
    geometry: GeolocusGeometry,
    direction: string,
    range: ComputeRegionRange,
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
      ['N', n],
      ['S', s],
      ['E', e],
      ['W', w],
    ])

    const center = geometry.getCenter()
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
    const bboxPolygon = new GeolocusGeometry(
      'Polygon',
      JTSGeometryFactory.bbox(target),
    )

    if (range === 'inside') {
      const intersection = Topology.intersection(bboxPolygon, geometry)
      return intersection as GeolocusGeometry
    } else {
      const difference = Topology.difference(bboxPolygon, geometry)
      return difference as GeolocusGeometry
    }
  }

  private static computeRelativeDirection(
    geometry: GeolocusGeometry,
    direction: string,
    range: ComputeRegionRange,
    orientation: number,
  ) {
    const directionTransform = direction
      .replace('F', 'N')
      .replace('B', 'S')
      .replace('R', 'E')
      .replace('L', 'W')
    const region = this.computeAbsoluteDirection(
      geometry,
      directionTransform,
      range,
    )
    const regionRotated = GeolocusGeometryTransformation.rotateAroundCoord(
      region,
      orientation,
      geometry.getCenter(),
    )

    return regionRotated
  }
}
