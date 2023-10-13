import { GeolocusGeometry } from '../geometry'
import { GEO_MAX_VALUE } from '../math'
import { Position2 } from '../type'

// enum AbsoluteDirection {
//   'TopNorthWest',
//   'TopNorth',
//   'TopNorthEast',
//   'TopWest',
//   'Top',
//   'TopEast',
//   'TopSouthWest',
//   'TopSouth',
//   'TopSouthEast',
//   'NorthWest',
//   'North',
//   'NorthEast',
//   'West',
//   'SamePosition',
//   'East',
//   'SouthWest',
//   'South',
//   'SouthEast',
//   'BottomNorthWest',
//   'BottomNorth',
//   'BottomNorthEast',
//   'BottomWest',
//   'Bottom',
//   'BottomEast',
//   'BottomSouthWest',
//   'BottomSouth',
//   'BottomSouthEast',
// }

// enum RelativeDirection {
//     'UpLeftForward',
//     'UpForward',
//     'UpRightForward',
//     'UpLeft',
//     'UpSamePosition',
//     'UpRight',
//     'UpLeftBackward',
//     'UpBackward',
//     'UpRightBackward',
//     'LeftForward',
//     'Forward',
//     'RightForward',
//     'Left',
//     'SamePosition',
//     'Right',
//     'LeftBackward',
//     'Backward',
//     'RightBackward',
//     'DownLeftForward',
//     'DownForward',
//     'DownRightForward',
//     'DownLeft',
//     'DownSamePosition',
//     'DownRight',
//     'DownLeftBackward',
//     'DownBackward',
//     'DownRightBackward',
// }
export class Direction {
  static computeRegion = (geometry: GeolocusGeometry, direction: string) => {
    const map = new Map([
      ['north', this.north],
      ['south', this.south],
      ['east', this.east],
      ['west', this.west],
    ])

    const tag = new Map([
      ['north', false],
      ['south', false],
      ['east', false],
      ['west', false],
    ])

    const source = [...geometry.getBBox().getVertex()] as [Position2, Position2]
    const target: [Position2, Position2] = [
      [-GEO_MAX_VALUE, -GEO_MAX_VALUE],
      [GEO_MAX_VALUE, GEO_MAX_VALUE],
    ]
    const lower = direction.toLowerCase()
    map.forEach((value, key) => {
      if (lower.includes(key)) {
        value(source, target, tag)
      }
    })

    return target
  }

  private static north = (
    source: [Position2, Position2],
    target: [Position2, Position2],
    tag: Map<string, boolean>,
  ) => {
    target[0][1] = source[1][1]
    tag.set('north', true)
  }

  private static south = (
    source: [Position2, Position2],
    target: [Position2, Position2],
    tag: Map<string, boolean>,
  ) => {
    if (tag.get('north')) {
      throw new Error(`North and south can't exist together at the same time.`)
    }
    target[1][1] = source[0][1]
    tag.set('south', true)
  }

  private static east = (
    source: [Position2, Position2],
    target: [Position2, Position2],
    tag: Map<string, boolean>,
  ) => {
    target[0][0] = source[1][0]
    tag.set('east', true)
  }

  private static west = (
    source: [Position2, Position2],
    target: [Position2, Position2],
    tag: Map<string, boolean>,
  ) => {
    if (tag.get('east')) {
      throw new Error(`East and west can't exist together at the same time.`)
    }
    target[1][0] = source[0][0]
    tag.set('west', true)
  }
}
