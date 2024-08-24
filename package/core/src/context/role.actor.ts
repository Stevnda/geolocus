import { SemanticDistanceMap } from '@/relation'
import { randomUUID } from 'crypto'
import { GeolocusContext } from './context'

interface RoleProps {
  setUUID(value: string): void
  getUUID(): string
  setName(value: string): void
  getName(): string
  setContext(value: GeolocusContext): void
  getContext(): GeolocusContext
  setOrientation(value: number): void
  getOrientation(): number
  setDirectionDelta(value: number): void
  getDirectionDelta(): number
  setDistanceDelta(value: number): void
  getDistanceDelta(): number
  setSemanticDistanceMap(value: SemanticDistanceMap): void
  getSemanticDistanceMap(): SemanticDistanceMap
}

export class Role implements RoleProps {
  private _uuid: string
  private _name: string
  private _orientation: number
  private _directionDelta: number
  private _distanceDelta: number
  private _semanticDistanceMap: SemanticDistanceMap
  private _context: GeolocusContext

  constructor(
    name: string,
    orientation: number,
    directionDelta: number,
    distanceDelta: number,
    semanticDistanceMap: SemanticDistanceMap,
    context: GeolocusContext,
  ) {
    this._uuid = randomUUID()
    this._name = name
    this._orientation = orientation
    this._directionDelta = directionDelta
    this._distanceDelta = distanceDelta
    this._semanticDistanceMap = semanticDistanceMap
    this._context = context
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

  getDirectionDelta(): number {
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
}
