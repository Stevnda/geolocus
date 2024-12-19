import { SemanticDistanceMap } from '@/relation'
import { GeolocusContext } from './context'
import { generateUUID } from '@/util'
import { SpatialRef } from './spatialReference'

export class Role {
  private _uuid: string
  private _name: string
  private _context: GeolocusContext
  private _orientation: number
  private _directionDelta: number
  private _distanceDelta: number
  private _timeDistanceMap: Map<string, number>
  private _semanticDistanceMap: SemanticDistanceMap
  private _weight: number
  private _spatialRef: SpatialRef
  private _isDefault: boolean

  constructor(
    name: string,
    orientation: number,
    directionDelta: number,
    distanceDelta: number,
    timeDistanceMap: Map<string, number>,
    semanticDistanceMap: SemanticDistanceMap,
    weight: number,
    spatialRef: SpatialRef,
    isDefault: boolean,
    context: GeolocusContext,
  ) {
    this._uuid = generateUUID()
    this._name = name
    this._context = context
    this._orientation = (orientation / 180) * Math.PI // azimuth, N=0, [0, 2pi]
    this._directionDelta = (directionDelta / 180) * Math.PI // azimuth, N=0, [0, 2pi]
    this._distanceDelta = distanceDelta
    this._timeDistanceMap = timeDistanceMap // string - rate (m/s)
    this._semanticDistanceMap = semanticDistanceMap
    this._weight = weight
    this._spatialRef = spatialRef
    this._isDefault = isDefault
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

  setTimeDistanceMap(value: Map<string, number>): void {
    this._timeDistanceMap = value
  }

  getTimeDistanceMap(): Map<string, number> {
    return this._timeDistanceMap
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

  setSpatialRef(value: SpatialRef): void {
    this._spatialRef = value
  }

  getSpatialRef(): SpatialRef {
    return this._spatialRef
  }

  getIsDefault(): boolean {
    return this._isDefault
  }

  setIsDefault(value: boolean): void {
    this._isDefault = value
  }
}
