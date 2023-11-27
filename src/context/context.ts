import { AbsoluteDirection } from '../relation'

export class GeolocusContext {
  static DISTANCE_DELTA = 0.2
  static DIRECTION_PARAM: {
    [props in AbsoluteDirection]: [number, number]
  } = {
    N: [0, Math.PI / 3],
    NE: [Math.PI / 4, Math.PI / 6],
    E: [Math.PI / 2, Math.PI / 3],
    SE: [(Math.PI / 4) * 3, Math.PI / 6],
    S: [Math.PI, Math.PI / 3],
    SW: [(Math.PI / 4) * 5, Math.PI / 6],
    W: [(Math.PI / 2) * 3, Math.PI / 3],
    NW: [(Math.PI / 4) * 7, Math.PI / 6],
  }

  static setDistanceDelta(value: number) {
    this.DISTANCE_DELTA = value
  }

  static setDirectionDelta(value: number): void
  static setDirectionDelta(
    ordinalDirection: number,
    cardinalDirection?: number,
  ): void {
    if (!cardinalDirection) {
      cardinalDirection = ordinalDirection
    }
    this.DIRECTION_PARAM = {
      N: [0, cardinalDirection],
      NE: [Math.PI / 4, ordinalDirection],
      E: [Math.PI / 2, cardinalDirection],
      SE: [(Math.PI / 4) * 3, ordinalDirection],
      S: [Math.PI, cardinalDirection],
      SW: [(Math.PI / 4) * 5, ordinalDirection],
      W: [(Math.PI / 2) * 3, cardinalDirection],
      NW: [(Math.PI / 4) * 7, ordinalDirection],
    }
  }
}
