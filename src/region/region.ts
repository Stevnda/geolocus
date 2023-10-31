import { Vector2 } from '../math'
import { GeolocusObject } from '../object'
import { Position2 } from '../type'

interface IGetRegionPDF {
  1: (
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
  ) => number
  2: (origin: Position2, target: Position2, baseline: number) => number
  3: (
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
    baseline: number,
  ) => number
}

export class RegionPDF {
  static distance(
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
  ) {
    const maxDistance = distance * delta

    const deviationDistance = Math.abs(
      Vector2.distanceTo(origin, target) - distance,
    )

    const radians = (deviationDistance / maxDistance) * Math.PI * 0.5

    return Math.cos(radians)
  }

  static angle(origin: Position2, target: Position2, baseline: number) {
    const radiansTransform = -baseline + Math.PI / 2
    const v1 = Vector2.sub(target, origin)
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]

    const radians = Vector2.angleTo(v1, v2)

    return Math.cos(radians)
  }

  static distanceAndAngle(
    origin: Position2,
    target: Position2,
    distance: number,
    delta: number,
    baseline: number,
  ) {
    return (
      this.angle(origin, target, baseline) *
      this.distance(origin, target, distance, delta)
    )
  }

  static getPDF<T extends keyof IGetRegionPDF>(number: T) {
    return {
      1: this.distance,
      2: this.angle,
      3: this.distanceAndAngle,
    }[number]
  }
}

interface IGeoRelation {
  name: 'topology' | 'distance' | 'direction'
  value: string | number
}

interface IRegionParam {
  position: Position2
  relation: IGeoRelation[]
}

interface IRegionResult {
  region: GeolocusObject
  PDF: {
    type: number
    position: Position2
  }
}

export class Region {
  private _param: IRegionParam[]
  private _result: IRegionResult | null
  private _delta: number | null

  constructor() {
    this._param = []
    this._result = null
    this._delta = null
  }

  setDeviation(value: number) {
    this._delta = value
  }

  compute() {
    console.log(this._param, this._result, this._delta)
    // const length = this._param.length
    // for (let index = 0; index < length; index++) {
    //   const param = this._param[index]
    // }
  }

  exportToImage() {
    //
  }

  exportToFormal() {
    //
  }

  exportToPointCloud() {
    //
  }
}
