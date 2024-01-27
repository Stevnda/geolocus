import { GeolocusObject } from '@/object'
import { Region } from '@/region'
import { AbsoluteDirection, EuclideanDistanceRange, Relation } from '@/relation'
import { GeolocusGlobalContext, GeolocusLocalContext } from '../context'
import { Route } from '../route'

// common
export type Position2 = [number, number]
export type Position3 = [number, number, number]

// context.ts
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
  parentContext: GeolocusContext
  name?: string
  orientation?: number
  directionDelta?: DirectionDelta
  distanceDelta?: number
  semanticDistanceMap?: SemanticDistanceMap
  resultGirdNum?: number
}

export interface IGeolocusContext {
  getUUID(): string
  getObjectByObjectUUID(uuid: string): GeolocusObject | undefined
  getObjectMap(): Map<string, GeolocusObject>
  getRoute(): Route
  getRelation(): Relation
  getRegion(): Region
  getName(): string
  getDirectionDelta(direction: string): [number, number]
  getDistanceDelta(): number
  getSemanticDistanceMap(): SemanticDistanceMap
  getResultGirdNum(): number
}

export type GeolocusContext = GeolocusGlobalContext | GeolocusLocalContext

// route.ts
export interface IRouteNode {
  parent?: Set<string>
  children?: Set<string>
}
