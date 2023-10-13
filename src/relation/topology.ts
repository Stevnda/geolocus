import booleanTouches from '@turf/boolean-touches'
import * as turf from '@turf/turf'

export class Topology {
  static isEqual = (geometry0: turf.Geometries, geometry1: turf.Geometries) => {
    return turf.booleanEqual(geometry0, geometry1)
  }

  static isIntersect = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanIntersects(geometry0, geometry1)
  }

  static isDisjoint = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanDisjoint(geometry0, geometry1)
  }

  static isWithin = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanWithin(geometry0, geometry1)
  }

  static isContains = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanContains(geometry0, geometry1)
  }

  static isTouch = (geometry0: turf.Geometries, geometry1: turf.Geometries) => {
    return booleanTouches(geometry0, geometry1)
  }

  static intersection = (
    polygon0: turf.Polygon,
    polygon1: turf.Polygon,
  ): null | turf.Polygon | turf.MultiPolygon => {
    const intersection = turf.intersect(polygon0, polygon1)

    if (!intersection) {
      return null
    }
    return intersection.geometry
  }

  private static buffer = (geometry: turf.Geometries, distance: number) => {
    return turf.buffer(geometry, distance, {
      units: 'degrees',
    }) as turf.Feature<turf.Polygon>
  }

  static bufferOfDistance = (geometry: turf.Geometries, distance: number) => {
    return this.buffer(geometry, distance).geometry
  }

  static bufferOfRange = (
    geometry: turf.Geometries,
    range: [number, number],
  ) => {
    const buffer0 = this.buffer(geometry, range[0])
    const buffer1 = this.buffer(geometry, range[1])

    return turf.mask(buffer1, buffer0).geometry
  }
}
