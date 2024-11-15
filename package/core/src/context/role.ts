import { SemanticDistanceMap } from '@/relation'
import { GeolocusContext } from './context'
import { generateUUID } from '@/util'

export class Role {
  private _uuid: string
  private _name: string
  private _context: GeolocusContext
  private _orientation: number
  private _directionDelta: number
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
    this._orientation = orientation // azimuth, N=0, [0, 2pi]
    this._directionDelta = directionDelta
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

  setDirectionDelta(value: number): void {
    this._directionDelta = value
  }

  getDirectionDelta() {
    return this._directionDelta
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
