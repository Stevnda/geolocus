import * as turf from '@turf/turf'

export class Topology {
  static isEqual2 = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanEqual(geometry0, geometry1)
  }

  static isIntersect2 = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanIntersects(geometry0, geometry1)
  }

  static isDisjoint2 = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanDisjoint(geometry0, geometry1)
  }

  static isWithin2 = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanWithin(geometry0, geometry1)
  }

  static isContains2 = (
    geometry0: turf.Geometries,
    geometry1: turf.Geometries,
  ) => {
    return turf.booleanContains(geometry0, geometry1)
  }

  static intersection2 = (
    polygon0: turf.Polygon,
    polygon1: turf.Polygon,
  ): null | turf.Polygon | turf.MultiPolygon => {
    const intersection = turf.intersect(polygon0, polygon1)

    if (!intersection) {
      return null
    }
    return intersection.geometry
  }

  private static buffer2 = (geometry: turf.Geometries, distance: number) => {
    return turf.buffer(geometry, distance, {
      units: 'degrees',
    }) as turf.Feature<turf.Polygon>
  }

  static buffer2OfDistance = (geometry: turf.Geometries, distance: number) => {
    return this.buffer2(geometry, distance).geometry
  }

  static buffer2OfRange = (
    geometry: turf.Geometries,
    range: [number, number],
  ) => {
    const buffer0 = this.buffer2(geometry, range[0])
    const buffer1 = this.buffer2(geometry, range[1])

    return turf.mask(buffer1, buffer0).geometry
  }
}
