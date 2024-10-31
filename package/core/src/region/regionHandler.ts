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
    role: Role,
  ): RegionHandlerResult => {
    const context = role.getContext()
    const distance = relation.distance as EuclideanDistance
    const originGeometry = origin.getGeometry()
    const objectType = originGeometry.getType()
    const N = role.getSemanticDistanceMap().N
    // NOTE 可以加入相对于物体形状百分比的概念
    const rangeDistance = (N[0] + N[1]) / 2
    let geometry: GeolocusGeometry | null = null
    if (objectType === 'Point' || objectType === 'LineString') {
      geometry = Topology.bufferOfDistance(
        originGeometry,
        rangeDistance,
      ) as GeolocusGeometry
    } else {
      const range = relation.range
      let bufferGeometry: GeolocusGeometry = originGeometry
      if (distance === 0) {
        bufferGeometry = originGeometry
      } else if (range === 'outside') {
        bufferGeometry = Topology.union(
          originGeometry,
          Topology.bufferOfDistance(
            originGeometry,
            distance,
          ) as GeolocusGeometry,
        ) as GeolocusGeometry
      } else {
        // inside
        const tempGeometry = Topology.bufferOfDistance(
          originGeometry,
          -distance,
        )
        if (tempGeometry === null) {
          bufferGeometry = new GeolocusGeometry(
            'Point',
            JTSGeometryFactory.point(originGeometry.getCenter()),
          )
        } else {
          bufferGeometry = Topology.difference(
            originGeometry,
            tempGeometry,
          ) as GeolocusGeometry
        }
      }

      geometry = Topology.bufferOfRange(bufferGeometry as GeolocusGeometry, [
        -rangeDistance,
        rangeDistance,
      ])
      if (geometry === null) {
        geometry = Topology.union(
          bufferGeometry,
          Topology.bufferOfDistance(
            bufferGeometry,
            rangeDistance,
          ) as GeolocusGeometry,
        ) as GeolocusGeometry
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
        const geometry = Topology.bufferOfRange(origin.getGeometry(), [
          minDistance,
          maxDistance,
        ]) as GeolocusGeometry
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
      },
      contain: (origin: GeolocusObject, relation: GeoRelation, role: Role) => {
        const topology = this.containHandler(
          origin,
          relation,
          role.getContext(),
        )

        let distanceRegion: GeolocusObject
        const geometry = Topology.bufferOfDistance(
          origin.getGeometry(),
          MAGIC_NUMBER,
        ) as GeolocusGeometry
        if (relation.distance === 0) {
          distanceRegion = new GeolocusObject(geometry)
        } else {
          const tempRegion = Topology.bufferOfDistance(
            geometry,
            -relation.distance,
          )
          if (tempRegion) {
            distanceRegion = new GeolocusObject(
              Topology.difference(
                origin.getGeometry(),
                tempRegion,
              ) as GeolocusGeometry,
            )
          } else {
            distanceRegion = new GeolocusObject(
              new GeolocusGeometry(
                'Polygon',
                JTSGeometryFactory.empty('Polygon'),
              ),
            )
          }
        }

        const intersection = this.intersection(
          topology.region as GeolocusObject,
          distanceRegion as GeolocusObject,
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
        const topology = this.intersectHandler(origin, relation, role)
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
    const td = this.topologyAndDistance(origin, relation, role)
    const direction = this.directionHandler(origin, relation, role)
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
