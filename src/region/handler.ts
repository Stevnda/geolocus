/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GeolocusContext } from '@/context'
import {
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
  createPolygonFromBBox,
} from '@/object'
import { Direction, Topology } from '@/relation'
import {
  AbsoluteDirection,
  EuclideanDistance,
  GeolocusObject,
  IGeoRelation,
  TopologyRelation,
} from '@/type'
import { Compare, GEO_MAX_VALUE, Vector2 } from '@/util'
import { IRegionPDF, IRegionResultHandler } from './type'

export class RegionResultHandler {
  private static equalHandler: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
  ) => {
    const region = Topology.bufferOfDistance(origin, 0.005)
    const pdf: IRegionPDF = {
      type: 0,
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: false }
  }

  private static containHandler: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
  ) => {
    const region = Topology.bufferOfDistance(origin, 0.005)
    const pdf: IRegionPDF = {
      type: 4,
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: region,
        girdNum: origin.getContext()!.getResultGirdNum(),
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: false }
  }

  private static intersectHandler: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ) => {
    const originBBox = origin.getBBox()
    const originLength =
      Vector2.distanceTo(
        [originBBox[0], originBBox[1]],
        [originBBox[2], originBBox[3]],
      ) * 0.005
    const targetBBox = target.getBBox()
    let targetLength = Vector2.distanceTo(
      [targetBBox[0], targetBBox[1]],
      [targetBBox[2], targetBBox[3]],
    )
    if (Compare.LE(targetLength, 0.005)) targetLength = 0.005
    if (Compare.LE(targetLength, originLength)) targetLength = originLength
    const objectType = origin.getType()
    let region: null | GeolocusPolygonObject = null
    if (objectType === 'Point' || objectType === 'LineString') {
      region = Topology.bufferOfDistance(origin, targetLength)
    } else {
      region = Topology.bufferOfRange(origin, [-targetLength, targetLength])
    }
    const pdf: IRegionPDF = {
      type: 4,
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: region,
        girdNum: origin.getContext()!.getResultGirdNum(),
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  private static touchHandler: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ) => {
    const originBBox = origin.getBBox()
    const originLength =
      Vector2.distanceTo(
        [originBBox[0], originBBox[1]],
        [originBBox[2], originBBox[3]],
      ) * 0.005
    const targetBBox = target.getBBox()
    let targetLength = Vector2.distanceTo(
      [targetBBox[0], targetBBox[1]],
      [targetBBox[2], targetBBox[3]],
    )
    if (Compare.LE(targetLength, 0.005)) targetLength = 0.005
    if (Compare.LE(targetLength, originLength)) targetLength = originLength
    const objectType = origin.getType()
    let region: null | GeolocusPolygonObject = null
    if (objectType === 'Point' || objectType === 'LineString') {
      region = Topology.bufferOfDistance(origin, targetLength)
    } else {
      region = Topology.bufferOfRange(origin, [0, targetLength])
    }
    const pdf: IRegionPDF = {
      type: 4,
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: region,
        girdNum: origin.getContext()!.getResultGirdNum(),
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  private static disjointHandler: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
  ) => {
    const bboxPolygon = createPolygonFromBBox(origin.getBBox())
    const buffer = Topology.bufferOfDistance(bboxPolygon, 0.005)
    const region = Topology.mask(
      createPolygonFromBBox([
        -GEO_MAX_VALUE,
        -GEO_MAX_VALUE,
        GEO_MAX_VALUE,
        GEO_MAX_VALUE,
      ]),
      buffer,
    )
    const pdf: IRegionPDF = {
      type: 0,
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }
    return { region, pdf, boundless: true }
  }

  private static topologyAndDirectionHelper = (
    origin: GeolocusObject,
    direction: string,
    region: GeolocusMultiPolygonObject | GeolocusPolygonObject,
    pdf: IRegionPDF,
    boundless: boolean,
  ) => {
    const originCenter = origin.getCenter()
    const directionRegion = Direction.computeRegion(
      new GeolocusPointObject(originCenter),
      direction,
    )
    let tempRegion = region
    if (region) {
      tempRegion = Topology.intersection(
        region,
        directionRegion,
      ) as GeolocusMultiPolygonObject
    }
    const tempPDF = pdf
    tempPDF.sdf.girdRegion = tempRegion

    return {
      region: tempRegion,
      pdf: tempPDF,
      boundless,
    }
  }

  static topology: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ) => {
    const topology = relation.topology as TopologyRelation
    const map = {
      equal: this.equalHandler,
      contain: this.containHandler,
      intersect: this.intersectHandler,
      touch: this.touchHandler,
      disjoint: this.disjointHandler,
    }
    const result = map[topology](origin, relation, target)

    return result
  }

  // 只有距离关系默认是相离
  static distance: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
  ) => {
    const context = origin.getContext() as GeolocusContext
    const distance = relation.distance as EuclideanDistance
    const bboxPolygon = createPolygonFromBBox(origin.getBBox())
    // martinez-polygon-clipping 的 intersect 函数的 bug, 加一个极小的随机误差
    const region = Topology.bufferOfRange(bboxPolygon, [
      (1 - context.getDistanceDelta() * 1.5) * distance - Math.random() / 100,
      (1 + context.getDistanceDelta() * 1.5) * distance + Math.random() / 100,
    ])
    const pdf: IRegionPDF = {
      type: 1,
      origin,
      gdf: {
        distance,
        distanceDelta: context.getDistanceDelta() * distance,
        azimuth: null,
        azimuthDelta: null,
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  // 只有方向关系默认是相离
  static direction: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
  ) => {
    const context = origin.getContext() as GeolocusContext
    const bboxPolygon = createPolygonFromBBox(origin.getBBox())
    const direction = relation.direction as AbsoluteDirection
    const region = Direction.computeRegion(bboxPolygon, direction)
    const pdf: IRegionPDF = {
      type: 2,
      origin,
      gdf: {
        distance: null,
        distanceDelta: null,
        azimuth: context.getDirectionDelta()[direction][0],
        azimuthDelta: context.getDirectionDelta()[direction][1],
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: true }
  }

  static topologyAndDirection: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ) => {
    const topology = relation.topology as TopologyRelation
    const direction = relation.direction as AbsoluteDirection

    const map = {
      equal: () => {
        const { region, pdf, boundless } = this.equalHandler(
          origin,
          relation,
          target,
        )
        return { region, pdf, boundless }
      },
      contain: () => {
        const { region, pdf, boundless } = this.containHandler(
          origin,
          relation,
          target,
        )
        return this.topologyAndDirectionHelper(
          origin,
          direction,
          region,
          pdf,
          boundless,
        )
      },
      intersect: () => {
        const { region, pdf, boundless } = this.intersectHandler(
          origin,
          relation,
          target,
        )
        return this.topologyAndDirectionHelper(
          origin,
          direction,
          region,
          pdf,
          boundless,
        )
      },
      touch: () => {
        const { region, pdf, boundless } = this.touchHandler(
          origin,
          relation,
          target,
        )
        return this.topologyAndDirectionHelper(
          origin,
          direction,
          region,
          pdf,
          boundless,
        )
      },
      disjoint: () => {
        return this.direction(origin, relation, target)
      },
    }
    return map[topology]()
  }

  // 存在距离默认相离
  static topologyAndDistance: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ) => {
    return this.distance(origin, relation, target)
  }

  // 存在距离默认相离
  static directionAndDistance: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
  ) => {
    const context = origin.getContext() as GeolocusContext
    const direction = relation.direction as AbsoluteDirection
    const directionRegion = Direction.computeRegion(origin, direction)

    const distance = relation.distance as EuclideanDistance
    const bboxPolygon = createPolygonFromBBox(origin.getBBox())
    // martinez-polygon-clipping 的 intersect 函数的 bug, 加一个极小的随机误差
    const buffer = Topology.bufferOfRange(bboxPolygon, [
      (1 - context.getDistanceDelta() * 1.5) * distance - Math.random() / 100,
      (1 + context.getDistanceDelta() * 1.5) * distance + Math.random() / 100,
    ])
    const region = Topology.intersection(
      directionRegion,
      buffer,
    ) as GeolocusMultiPolygonObject
    const pdf: IRegionPDF = {
      type: 3,
      origin,
      gdf: {
        distance,
        distanceDelta: context.getDistanceDelta() * distance,
        azimuth: context.getDirectionDelta()[direction][0],
        azimuthDelta: context.getDirectionDelta()[direction][1],
      },
      sdf: {
        girdRegion: null,
        girdNum: null,
      },
      weight: relation.weight,
    }

    return { region, pdf, boundless: false }
  }

  // 存在距离默认相离
  static all: IRegionResultHandler = (
    origin: GeolocusObject,
    relation: IGeoRelation,
    target: GeolocusObject,
  ) => {
    return this.directionAndDistance(origin, relation, target)
  }
}
