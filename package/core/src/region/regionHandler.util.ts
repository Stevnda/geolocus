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
import { GeolocusContext, Role } from '@/context'

const MAGIC_NUMBER = 0.005

export class RegionResultHandler {
  private static intersection = (
    object0: GeolocusObject,
    object1: GeolocusObject,
  ) => {
    let intersection = Topology.intersection(
      object0.getGeometry(),
      object1.getGeometry(),
    )
    if (!intersection) {
      intersection = new GeolocusGeometry(
        'Polygon',
        JTSGeometryFactory.empty('Polygon'),
      )
    }
    return new GeolocusObject(intersection)
  }

  private static containHandler = (
    origin: GeolocusObject,
    relation: GeoRelation,
    context: GeolocusContext,
  ): RegionHandlerResult => {
    const geometry = Topology.bufferOfDistance(
      origin.getGeometry(),
      MAGIC_NUMBER,
    ) as GeolocusGeometry
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
    context: GeolocusContext,
    distance: number,
  ): RegionHandlerResult => {
    const objectType = origin.getGeometry().getType()
    let geometry: GeolocusGeometry | null = null
    if (objectType === 'Point' || objectType === 'LineString') {
      geometry = Topology.bufferOfDistance(
        origin.getGeometry(),
        distance,
      ) as GeolocusGeometry
    } else {
      const range = relation.range
      if (range === 'both') {
        geometry = Topology.bufferOfRange(origin.getGeometry(), [
          -distance,
          distance,
        ])
      } else if (range === 'inside') {
        geometry = Topology.bufferOfDistance(origin.getGeometry(), distance)
      } else {
        geometry = Topology.bufferOfDistance(origin.getGeometry(), distance)
      }
    }
    const region =
      geometry != null
        ? new GeolocusObject(geometry)
        : new GeolocusObject(
            new GeolocusGeometry(
              'Polygon',
              JTSGeometryFactory.empty('Polygon'),
            ),
          )
    const pdf: RegionPDFInput = {
      type: 'sdf',
      origin,
      gdf: {},
      sdf: {
        girdRegion: region || undefined,
        girdNum: context.getGridSize(),
      },
      weight: relation.weight || 1,
    }

    return { region, pdf }
  }

  private static disjointHandler = (
    origin: GeolocusObject,
    relation: GeoRelation,
    context: GeolocusContext,
  ): RegionHandlerResult => {
    const maxDistance = context.getMaxDistance()
    const buffer = Topology.bufferOfDistance(
      origin.getGeometry(),
      MAGIC_NUMBER,
    ) as GeolocusGeometry
    const geometry = Topology.difference(
      new GeolocusGeometry(
        'Polygon',
        JTSGeometryFactory.bbox([
          -maxDistance,
          -maxDistance,
          maxDistance,
          maxDistance,
        ]),
      ),
      buffer,
    )
    const region =
      geometry != null
        ? new GeolocusObject(geometry)
        : new GeolocusObject(
            new GeolocusGeometry(
              'Polygon',
              JTSGeometryFactory.empty('Polygon'),
            ),
          )
    const pdf: RegionPDFInput = {
      type: 'constant',
      origin,
      gdf: {},
      sdf: {},
      weight: relation.weight || 1,
    }
    return { region, pdf }
  }

  private static topology = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const context = role.getContext()
    const defaultDistance =
      role.getSemanticDistanceMap().M.reduce((a, b) => a + b, 0) / 2
    const topology = relation.topology
    const map = {
      contain: this.containHandler,
      intersect: this.intersectHandler,
      disjoint: this.disjointHandler,
    }
    const result = map[topology](origin, relation, context, defaultDistance)

    return result
  }

  private static distance = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const distance = Distance.normalize(
      relation.distance as EuclideanDistance | EuclideanDistanceRange,
    )
    const meanDistanceDelta = role.getDistanceDelta() * distance.mean
    const minDistance =
      distance.min - meanDistanceDelta * 1.5 < 0
        ? 0
        : distance.min - meanDistanceDelta * 1.5
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3
    const geometry = Distance.computeRegion(
      origin.getGeometry(),
      [minDistance, maxDistance],
      relation.range,
    ) as GeolocusGeometry
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

  private static direction = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const direction = relation.direction as
      | AbsoluteDirection
      | RelativeDirection
    const directionDelta = role.getDirectionDelta(direction)
    const geometry = Direction.computeRegion(
      origin.getGeometry(),
      direction,
      relation.range,
      role.getOrientation(),
    )
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

  private static directionAndDistance = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const direction = relation.direction as
      | AbsoluteDirection
      | RelativeDirection
    const directionRegion = Direction.computeRegion(
      origin.getGeometry(),
      direction,
      relation.range,
      role.getOrientation(),
    )
    const directionDelta = role.getDirectionDelta(direction)
    const distance = Distance.normalize(
      relation.distance as EuclideanDistance | EuclideanDistanceRange,
    )
    const meanDistanceDelta = role.getDistanceDelta() * distance.mean
    const minDistance =
      distance.min - meanDistanceDelta * 1.5 < 0
        ? 0
        : distance.min - meanDistanceDelta * 1.5
    const maxDistance = distance.max + meanDistanceDelta * 1.5
    const distanceDelta = (maxDistance - minDistance) / 3
    const distanceRegion = Distance.computeRegion(
      origin.getGeometry(),
      [minDistance, maxDistance],
      relation.range,
    ) as GeolocusGeometry
    const geometry = Topology.intersection(
      directionRegion,
      distanceRegion,
    ) as GeolocusGeometry
    const region = new GeolocusObject(geometry)
    const pdf: RegionPDFInput = {
      type: 'distanceAndAngle',
      origin,
      gdf: {
        distance: distance.mean,
        distanceDelta,
        azimuth: directionDelta[0],
        azimuthDelta: directionDelta[1],
      },
      sdf: {},
      weight: relation.weight,
    }

    return { region, pdf }
  }

  private static topologyAndDistance = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (
        origin: GeolocusObject,
        relation: GeoRelation,
        role: Role,
      ) => RegionHandlerResult
    > = {
      disjoint: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const distance = this.distance(origin, relation, role)
        return distance
      },
      contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.topology(origin, relation, role)
        const distance = this.distance(origin, relation, role)
        const intersection = this.intersection(
          topology.region as GeolocusObject,
          distance.region as GeolocusObject,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: GeolocusObject,
        relation: GeoRelation,
        role: Role,
      ) => {
        const topology = this.topology(origin, relation, role)
        const distance = this.distance(origin, relation, role)
        const intersection = this.intersection(
          topology.region as GeolocusObject,
          distance.region as GeolocusObject,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology
    const result = map[topology](origin, relation, role)

    return result
  }

  private static topologyAndDirection = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (
        origin: GeolocusObject,
        relation: GeoRelation,
        role: Role,
      ) => RegionHandlerResult
    > = {
      disjoint: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const direction = this.direction(origin, relation, role)
        return direction
      },
      contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.topology(origin, relation, role)
        const direction = this.direction(origin, relation, role)
        const intersection = this.intersection(
          topology.region as GeolocusObject,
          direction.region as GeolocusObject,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: GeolocusObject,
        relation: GeoRelation,
        role: Role,
      ) => {
        const topology = this.topology(origin, relation, role)
        const direction = this.direction(origin, relation, role)
        const intersection = this.intersection(
          topology.region as GeolocusObject,
          direction.region as GeolocusObject,
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology
    const result = map[topology](origin, relation, role)

    return result
  }

  private static all = (
    origin: GeolocusObject,
    relation: GeoRelation,
    role: Role,
  ): RegionHandlerResult => {
    const map: Record<
      TopologyRelation,
      (
        origin: GeolocusObject,
        relation: GeoRelation,
        role: Role,
      ) => RegionHandlerResult
    > = {
      disjoint: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const directionAndDistance = this.directionAndDistance(
          origin,
          relation,
          role,
        )
        return directionAndDistance
      },
      contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.topology(origin, relation, role)
        const direction = this.direction(origin, relation, role)
        const distance = this.distance(origin, relation, role)
        const intersection = this.intersection(
          topology.region,
          this.intersection(direction.region, distance.region),
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
      intersect: (
        origin: GeolocusObject,
        relation: GeoRelation,
        role: Role,
      ) => {
        const topology = this.topology(origin, relation, role)
        const direction = this.direction(origin, relation, role)
        const distance = this.distance(origin, relation, role)
        const intersection = this.intersection(
          topology.region,
          this.intersection(direction.region, distance.region),
        )
        topology.region = intersection
        topology.pdf.sdf.girdRegion = intersection
        return topology
      },
    }

    const topology = relation.topology
    const result = map[topology](origin, relation, role)
    return result
  }

  static getRegionHandler(relation: GeoRelation) {
    if (relation.direction != null && relation.direction != null) {
      return this.all
    }
    if (relation.direction != null) {
      return this.topologyAndDirection
    }
    if (relation.distance != null) {
      return this.topologyAndDistance
    }
    return this.topology
  }
}
