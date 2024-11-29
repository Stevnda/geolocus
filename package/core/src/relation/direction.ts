import {
  GeolocusBBox,
  GeolocusGeometry,
  JTSGeometryFactory,
  GeolocusGeometryAction,
  Position2,
} from '@/object'
import { GEO_MAX_VALUE } from '@/util'
import {
  AbsoluteDirection,
  ComputeRegionRange,
  SeManticDirection,
} from './relation.type'
import { Topology } from './topology'
import { Role } from '@/context'

export class Direction {
  // radian from [1,0] (N)
  // range: [0,2pi]
  static azimuth(vector: Position2): number {
    const angle =
      (Math.PI / 2 - Math.atan2(vector[1], vector[0]) + 2 * Math.PI) %
      (2 * Math.PI)
    return angle
  }

  static transform(direction: SeManticDirection | number, role: Role) {
    if (typeof direction === 'number') return (direction / 360) * 2 * Math.PI

    const AbsoluteDirectionMap = {
      N: 0,
      NE: Math.PI / 4,
      E: Math.PI / 2,
      SE: (3 * Math.PI) / 4,
      S: Math.PI,
      SW: (5 * Math.PI) / 4,
      W: (3 * Math.PI) / 2,
      NW: (7 * Math.PI) / 4,
    }
    if (direction in AbsoluteDirectionMap)
      return AbsoluteDirectionMap[<AbsoluteDirection>direction]

    const transformDirection = <AbsoluteDirection>(
      direction
        .replace('F', 'N')
        .replace('B', 'S')
        .replace('R', 'E')
        .replace('L', 'W')
    )

    return AbsoluteDirectionMap[transformDirection] + role.getOrientation()
  }

  static computeRegion(
    geometry: GeolocusGeometry,
    direction: number,
    range: ComputeRegionRange,
  ) {
    const center = geometry.getCenter()
    const target: GeolocusBBox = [
      -GEO_MAX_VALUE,
      center[1],
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ]
    const bbox = new GeolocusGeometry(
      'Polygon',
      JTSGeometryFactory.bbox(target),
    )
    const bboxRotated = GeolocusGeometryAction.rotateAroundCoord(
      bbox,
      direction,
      geometry.getCenter(),
    )

    if (range === 'inside') {
      const intersection = Topology.intersection(bboxRotated, geometry)
      return intersection as GeolocusGeometry
    } else if (range === 'outside') {
      const difference = Topology.difference(bboxRotated, geometry)
      return difference as GeolocusGeometry
    } else {
      return bboxRotated as GeolocusGeometry
    }
  }
}
