import { AbsoluteDirection, RelativeDirection, SemanticDistanceMap } from '@/relation'
import { GeolocusContext } from './context'
import { DirectionDelta } from './context.type'
import { generateUUID } from '@/util'

export class Role {
  private _uuid: string
  private _name: string
  private _context: GeolocusContext
  private _orientation: number
  private _directionDelta: DirectionDelta
  private _distanceDelta: number
  private _semanticDistanceMap: SemanticDistanceMap
  private _weight: number

  constructor(
    name: string,
    orientation: number,
    directionDelta: number,
    distanceDelta: number,
    semanticDistanceMap: SemanticDistanceMap,
    weight: number,
    context: GeolocusContext,
  ) {
    this._uuid = generateUUID()
    this._name = name
    this._context = context
    this._orientation = orientation
    this._directionDelta = {
      N: [0, directionDelta],
      NE: [Math.PI / 4, directionDelta],
      E: [Math.PI / 2, directionDelta],
      SE: [(Math.PI / 4) * 3, directionDelta],
      S: [Math.PI, directionDelta],
      SW: [(Math.PI / 4) * 5, directionDelta],
      W: [(Math.PI / 2) * 3, directionDelta],
      NW: [(Math.PI / 4) * 7, directionDelta],
    }
    this._distanceDelta = distanceDelta
    this._semanticDistanceMap = semanticDistanceMap
    this._weight = weight
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  setName(value: string): void {
    this._name = value
  }

  getName(): string {
    return this._name
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }

  getContext(): GeolocusContext {
    return this._context
  }

  setOrientation(value: number): void {
    this._orientation = value
  }

  getOrientation(): number {
    return this._orientation
  }

  setDirectionDelta(value: DirectionDelta): void {
    this._directionDelta = value
  }

  getDirectionDelta(value: AbsoluteDirection | RelativeDirection): [number, number] {
    const AbsoluteDirectionMap = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    if (AbsoluteDirectionMap.includes(value)) {
      return this._directionDelta[value as AbsoluteDirection]
    } else {
      // relativeDirection to TAbsoluteDirection
      const directionTransform = value
        .replace('F', 'N')
        .replace('B', 'S')
        .replace('R', 'E')
        .replace('L', 'W') as AbsoluteDirection
      const delta = this._directionDelta[directionTransform]
      // add offset of angle
      return [delta[0] + this._orientation, delta[1]]
    }
  }

  setDistanceDelta(value: number): void {
    this._distanceDelta = value
  }

  getDistanceDelta(): number {
    return this._distanceDelta
  }

  setSemanticDistanceMap(value: SemanticDistanceMap): void {
    this._semanticDistanceMap = value
  }

  getSemanticDistanceMap(): SemanticDistanceMap {
    return this._semanticDistanceMap
  }

  setWeight(value: number): void {
    this._weight = value
  }

  getWeight(): number {
    return this._weight
  }
}
