import { GeolocusGeometry, JTSGeometryFactory, GeolocusObject } from '@/object'
import {
  Direction,
  Distance,
  GeoRelation,
  Topology,
  EuclideanDistance,
  EuclideanDistanceRange,
  TopologyRelation,
} from '@/relation'
import { RegionHandlerResult, RegionPDFInput } from './region.type'
import { Role } from '@/context'

const MAGIC_NUMBER = 0.005

export class RegionResultHandler {
  private static intersection = (object0: GeolocusObject, object1: GeolocusObject) => {
    let intersection = Topology.intersection(object0.getGeometry(), object1.getGeometry())
    if (!intersection) {
      intersection = new GeolocusGeometry('Polygon', JTSGeometryFactory.empty('Polygon'))
    }
    return new GeolocusObject(intersection)
  }

  private static disjointHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
    const distance = Distance.normalize(relation.distance as EuclideanDistance | EuclideanDistanceRange)
    const meanDistanceDelta = role.getDistanceDelta() * distance.mean
    const minDistance = distance.min - meanDistanceDelta * 1.5 >= 0 ? distance.min - meanDistanceDelta * 1.5 : 0
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3

    const geometry = <GeolocusGeometry>Topology.bufferOfRange(origin.getGeometry(), [minDistance, maxDistance])
    const region = new GeolocusObject(geometry)

    const pdf: RegionPDFInput = {
      type: 'distance',
      origin,
      gdf: {
        distance: distance.mean,
        distanceDelta,
      },
      sdf: {},
      weight: relation.weight,
    }

    return { region, pdf }
  }

  private static containHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const context = role.getContext()
    const geometry = Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER) as GeolocusGeometry
    const region = new GeolocusObject(geometry) as GeolocusObject
    const pdf: RegionPDFInput = {
      type: 'sdf',
      origin,
      gdf: {},
      sdf: {
        girdRegion: region,
        girdNum: context.getGridSize(),
      },
      weight: relation.weight || 1,
    }
    return { region, pdf }
  }

  private static intersectHandler = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const context = role.getContext()
    const originGeometry = origin.getGeometry()
    const objectType = originGeometry.getType()

    // 取外接矩形对角线的十分之一和语义关系近的平均值两者的最大值, 作为缓冲区距离
    const N = role.getSemanticDistanceMap().N
    const bbox = originGeometry.getBBox()
    const dx = bbox[2] - bbox[0]
    const dy = bbox[3] - bbox[1]
    const distance = Math.max((N[0] + N[1]) / 2, Math.sqrt(dx * dx + dy * dy) / 10)

    let geometry: GeolocusGeometry | null = null
    if (objectType === 'Point' || objectType === 'LineString') {
      geometry = <GeolocusGeometry>Topology.bufferOfDistance(originGeometry, distance)
    } else {
      const range = relation.range
      const outside = <GeolocusGeometry>Topology.bufferOfDistance(originGeometry, distance)
      const inside = Topology.bufferOfDistance(originGeometry, -distance)
      if (inside === null) {
        geometry = {
          both: outside,
          outside: <GeolocusGeometry>Topology.difference(outside, originGeometry),
          inside: originGeometry,
        }[range]
      } else {
        geometry = {
          both: <GeolocusGeometry>Topology.difference(outside, inside),
          outside: <GeolocusGeometry>Topology.difference(outside, originGeometry),
          inside: <GeolocusGeometry>Topology.difference(originGeometry, inside),
        }[range]
      }
    }

    const region = new GeolocusObject(geometry)
    const pdf: RegionPDFInput = {
      type: 'sdf',
      origin,
      gdf: {},
      sdf: {
        girdRegion: region,
        girdNum: context.getGridSize(),
      },
      weight: relation.weight || 1,
    }

    return { region, pdf }
  }

  private static directionHandler = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const direction = <number>relation.direction
    const directionDelta = role.getDirectionDelta()
    const geometry = Direction.computeRegion(origin.getGeometry(), direction, relation.range)
    const region = new GeolocusObject(geometry)
    const pdf: RegionPDFInput = {
      type: 'angle',
      origin,
      gdf: {
        azimuth: direction,
        azimuthDelta: directionDelta,
      },
      sdf: {},
      weight: relation.weight,
    }

    return { region, pdf }
  }

  private static distanceHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
    // 相离关系直接返回 origin
    if (relation.topology === 'disjoint') return origin

    let distanceRegion: GeolocusObject
    const geometry = Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER) as GeolocusGeometry
    // 如果 distance=0, origin 不变
    if (relation.distance === 0) {
      distanceRegion = origin
    } // 如果 distance 为数值, origin 放缩
    else if (typeof relation.distance === 'number') {
      const temp = Topology.bufferOfDistance(geometry, relation.distance)
      if (temp) {
        distanceRegion = new GeolocusObject(<GeolocusGeometry>Topology.difference(origin.getGeometry(), temp))
      } else {
        distanceRegion = new GeolocusObject(new GeolocusGeometry('Polygon', JTSGeometryFactory.empty('Polygon')))
      }
    } // 如果 distance 为数值范围, 根据 disjoint 算出目标区域, 然后 topology 强制为 contain
    else {
      const { region } = this.disjointHandler(origin, relation, role)
      relation.topology = 'contain'
      relation.direction = undefined
      distanceRegion = region
    }

    return distanceRegion
  }

  private static topologyAndDistance = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (origin: GeolocusObject, relation: GeoRelation, role: Role) => RegionHandlerResult
    > = {
      disjoint: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const res = this.disjointHandler(origin, relation, role)

        return res
      },
      contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const res = this.containHandler(origin, relation, role)

        return res
      },
      intersect: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.intersectHandler(origin, relation, role)
        return topology
      },
      along: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.intersectHandler(origin, relation, role)
        return topology
      },
    }

    const distanceRegion = this.distanceHandler(origin, relation, role)
    const topology = relation.topology
    const result = map[topology](distanceRegion, relation, role)

    return result
  }

  private static all = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (origin: GeolocusObject, relation: GeoRelation, role: Role) => RegionHandlerResult
    > = {
      disjoint: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const res = this.disjointHandler(origin, relation, role)

        return res
      },
      contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const res = this.containHandler(origin, relation, role)

        return res
      },
      intersect: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.intersectHandler(origin, relation, role)
        return topology
      },
      along: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.intersectHandler(origin, relation, role)
        return topology
      },
    }

    const distanceRegion = this.distanceHandler(origin, relation, role)
    const topology = relation.topology
    const td = map[topology](distanceRegion, relation, role)
    if (relation.direction == null) {
      return td
    } else {
      const direction = this.directionHandler(distanceRegion, relation, role)
      const intersection = this.intersection(td.region, direction.region)

      td.region = intersection
      td.pdf.sdf.girdRegion = intersection
      td.pdf.type = td.pdf.type === 'sdf' ? 'sdf' : 'distanceAndAngle'
      td.pdf.gdf = {
        ...td.pdf.gdf,
        azimuth: direction.pdf.gdf.azimuth,
        azimuthDelta: direction.pdf.gdf.azimuthDelta,
      }

      return td
    }
  }

  static getRegionHandler(relation: GeoRelation) {
    if (relation.direction != null) {
      return this.all
    } else {
      return this.topologyAndDistance
    }
  }
}
