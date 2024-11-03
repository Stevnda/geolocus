import { GeolocusGeometry, JTSGeometryFactory, GeolocusObject } from '@/object'
import {
  Direction,
  Distance,
  GeoRelation,
  Topology,
  EuclideanDistance,
  EuclideanDistanceRange,
  AbsoluteDirection,
  RelativeDirection,
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
    const minDistance = distance.min - meanDistanceDelta * 1.5 < 0 ? 0 : distance.min - meanDistanceDelta * 1.5
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3

    const geometry = Topology.bufferOfRange(origin.getGeometry(), [minDistance, maxDistance]) as GeolocusGeometry
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
    const N = role.getSemanticDistanceMap().N
    // NOTE 这里目前用的 near, 以后可能使用对象的相对大小
    const distance = (N[0] + N[1]) / 2
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

  private static alongHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const context = role.getContext()
    const originGeometry = origin.getGeometry()
    const originType = originGeometry.getType()
    const N = role.getSemanticDistanceMap().N
    const distance = (N[0] + N[1]) / 2
    let geometry: GeolocusGeometry | null = null
    if (originType === 'Point' || originType === 'LineString') {
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
    const direction = relation.direction as AbsoluteDirection | RelativeDirection
    const directionDelta = role.getDirectionDelta(direction)
    const geometry = Direction.computeRegion(origin.getGeometry(), direction, relation.range, role.getOrientation())
    const region = new GeolocusObject(geometry)
    const pdf: RegionPDFInput = {
      type: 'angle',
      origin,
      gdf: {
        azimuth: directionDelta[0],
        azimuthDelta: directionDelta[1],
      },
      sdf: {},
      weight: relation.weight,
    }

    return { region, pdf }
  }

  private static distanceHandler = (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
    if (relation.topology === 'disjoint') return origin

    let distanceRegion: GeolocusObject
    const geometry = Topology.bufferOfDistance(origin.getGeometry(), MAGIC_NUMBER) as GeolocusGeometry
    if (relation.distance === 0) {
      distanceRegion = new GeolocusObject(geometry)
    } else if (typeof relation.distance === 'number') {
      const temp = Topology.bufferOfDistance(geometry, relation.distance)
      if (temp) {
        distanceRegion = new GeolocusObject(<GeolocusGeometry>Topology.difference(origin.getGeometry(), temp))
      } else {
        distanceRegion = new GeolocusObject(new GeolocusGeometry('Polygon', JTSGeometryFactory.empty('Polygon')))
      }
    } else {
      const { region } = this.disjointHandler(origin, relation, role)
      relation.topology = 'contain'
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
        const topology = this.alongHandler(origin, relation, role)
        return topology
      },
    }

    const distanceRegion = this.distanceHandler(origin, relation, role)
    const topology = relation.topology
    const result = map[topology](distanceRegion, relation, role)

    return result
  }

  private static all = (origin: GeolocusObject, relation: GeoRelation, role: Role): RegionHandlerResult => {
    const td = this.topologyAndDistance(origin, relation, role)
    const direction = this.directionHandler(td.region, relation, role)
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

  static getRegionHandler(relation: GeoRelation) {
    if (relation.direction != null) {
      return this.all
    } else {
      return this.topologyAndDistance
    }
  }
}
