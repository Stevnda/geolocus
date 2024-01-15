import { Region } from '@/region'
import { Relation } from '@/relation'
import {
  AbsoluteDirection,
  EuclideanDistanceRange,
  GeolocusObject,
} from '@/type'
import { Route } from '../route'

export type DirectionDelta = {
  [props in AbsoluteDirection]: [number, number]
}

export type SemanticDistanceMap = [
  EuclideanDistanceRange,
  EuclideanDistanceRange,
  EuclideanDistanceRange,
  EuclideanDistanceRange,
  EuclideanDistanceRange,
]

export interface IGeolocusContextInit {
  name?: string
  directionDelta?: DirectionDelta
  distanceDelta?: number
  semanticDistanceMap?: SemanticDistanceMap
  resultGirdNum?: number
}

export interface IGeolocusContext {
  addObject(uuid: string, object: GeolocusObject): void
  getObjectByUUID(key: string): GeolocusObject | undefined
  getObjectMap(): Map<string, GeolocusObject>
  getRoute(): Route
  getRelation(): Relation
  getRegion(): Region
  getName(): string
  getDirectionDelta(): DirectionDelta
  getDistanceDelta(): number
  getSemanticDistanceMap(): SemanticDistanceMap
  getResultGirdNum(): number
}
