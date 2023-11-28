import { GEO_MAX_VALUE } from '../math'
import { GeolocusObject, GeolocusPolygonObject } from '../object'
import { GeolocusBBox, Position2 } from '../type'

export class Direction {
  static azimuth(vector: Position2): number {
    const angle =
      (Math.PI / 2 - Math.atan2(vector[1], vector[0]) + 2 * Math.PI) %
      (2 * Math.PI)
    return angle
  }

  static computeRegion = (object: GeolocusObject, direction: string) => {
    const map = new Map([
      ['n', this.north],
      ['s', this.south],
      ['e', this.east],
      ['w', this.west],
    ])

    const tag = new Map([
      ['n', false],
      ['s', false],
      ['e', false],
      ['w', false],
    ])

    const source = object.getBBox()
    const target: GeolocusBBox = [
      -GEO_MAX_VALUE,
      -GEO_MAX_VALUE,
      GEO_MAX_VALUE,
      GEO_MAX_VALUE,
    ]
    const lower = direction.toLowerCase()
    map.forEach((value, key) => {
      if (lower.includes(key)) {
        value(source, target, tag)
      }
    })

    return GeolocusPolygonObject.fromBBox(target)
  }

  private static north = (
    source: GeolocusBBox,
    target: GeolocusBBox,
    tag: Map<string, boolean>,
  ) => {
    target[1] = source[3]
    tag.set('n', true)
  }

  private static south = (
    source: GeolocusBBox,
    target: GeolocusBBox,
    tag: Map<string, boolean>,
  ) => {
    if (tag.get('n')) {
      throw new Error(`North and south can't exist together at the same time.`)
    }
    target[3] = source[1]
    tag.set('s', true)
  }

  private static east = (
    source: GeolocusBBox,
    target: GeolocusBBox,
    tag: Map<string, boolean>,
  ) => {
    target[0] = source[2]
    tag.set('e', true)
  }

  private static west = (
    source: GeolocusBBox,
    target: GeolocusBBox,
    tag: Map<string, boolean>,
  ) => {
    if (tag.get('e')) {
      throw new Error(`East and west can't exist together at the same time.`)
    }
    target[2] = source[0]
    tag.set('w', true)
  }
}
