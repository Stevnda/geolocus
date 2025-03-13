import {
  GeolocusGeometry,
  JTSGeometryFactory,
  GeolocusGeometryAction,
  Position2,
} from '@/object'
import { GEO_MAX_VALUE } from '@/util'
import {
  AbsoluteDirection,
  ComputeRegionRange,
  SemanticDirection,
} from './relation.type'
import { Topology } from './topology'
import { Role } from '@/context'

export class Direction {
  // radian from [0, 1] (N)
  // range: [0,2pi]
  static azimuth(vector: Position2): number {
    const angle =
      (Math.PI / 2 - Math.atan2(vector[1], vector[0]) + 2 * Math.PI) %
      (2 * Math.PI)
    return angle
  }

  static transform(
    direction: SemanticDirection | number,
    role: Role,
  ): [number, number] {
    if (typeof direction === 'number')
      return [(direction / 360) * 2 * Math.PI, 2 * role.getDirectionDelta()]

    const AbsoluteDirectionMap: Record<string, [number, number]> = {
      N: [0, Math.PI],
      NE: [Math.PI / 4, Math.PI / 2],
      E: [Math.PI / 2, Math.PI],
      SE: [(3 * Math.PI) / 4, Math.PI / 2],
      S: [Math.PI, Math.PI],
      SW: [(5 * Math.PI) / 4, Math.PI / 2],
      W: [(3 * Math.PI) / 2, Math.PI],
      NW: [(7 * Math.PI) / 4, Math.PI / 2],
    }
    if (direction in AbsoluteDirectionMap) {
      return AbsoluteDirectionMap[<AbsoluteDirection>direction]
    }

    const transformDirection = <AbsoluteDirection>(
      direction
        .replace('F', 'N')
        .replace('B', 'S')
        .replace('R', 'E')
        .replace('L', 'W')
    )

    return [
      AbsoluteDirectionMap[transformDirection][0] + role.getOrientation(),
      AbsoluteDirectionMap[transformDirection][1],
    ]
  }

  static computeRegion(
    geometry: GeolocusGeometry,
    direction: [number, number],
    range: ComputeRegionRange,
  ) {
    const [angle, angleRange] = direction
    const halfAngle = angleRange / 2
    const center = geometry.getCenter()
    const ld: Position2 = [
      center[0] - GEO_MAX_VALUE * Math.sin(halfAngle),
      center[1] + GEO_MAX_VALUE * Math.cos(halfAngle),
    ]
    const rd: Position2 = [
      center[0] + GEO_MAX_VALUE * Math.sin(halfAngle),
      center[1] + GEO_MAX_VALUE * Math.cos(halfAngle),
    ]
    const rt: Position2 = [GEO_MAX_VALUE, GEO_MAX_VALUE]
    const lt: Position2 = [-GEO_MAX_VALUE, GEO_MAX_VALUE]
    const polygon = new GeolocusGeometry(
      'Polygon',
      JTSGeometryFactory.polygon([[center, rd, rt, lt, ld, center]]),
    )
    const bboxRotated = GeolocusGeometryAction.rotateAroundCoord(
      polygon,
      angle,
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
