import { TGeolocusObject } from '@/object'
import { Region } from '@/region'
import {
  Relation,
  TAbsoluteDirection,
  TEuclideanDistanceRange,
} from '@/relation'
import { GeolocusGlobalContext, GeolocusLocalContext } from './context'
import { Route } from './route'

// common
export type TPosition2 = [number, number]
export type TPosition3 = [number, number, number]

// context.ts
export type TDirectionDelta = {
  [props in TAbsoluteDirection]: [number, number]
}

export type TSemanticDistanceMap = [
  TEuclideanDistanceRange,
  TEuclideanDistanceRange,
  TEuclideanDistanceRange,
  TEuclideanDistanceRange,
  TEuclideanDistanceRange,
]

export interface IGeolocusGlobalContextInit {
  name: string | null
  orientation: number | null
  directionDelta:
    | number
    | [number, number]
    | [number, number, number, number, number, number, number, number]
    | null
  distanceDelta: number | null
  semanticDistanceMap: TSemanticDistanceMap | null
  resultGirdNum: number | null
}

export interface IGeolocusLocalContextInit {
  parentContext: TGeolocusContext
  name: string | null
  orientation: number | null
  directionDelta:
    | number
    | [number, number]
    | [number, number, number, number, number, number, number, number]
    | null
  distanceDelta: number | null
  semanticDistanceMap: TSemanticDistanceMap | null
  resultGirdNum: number | null
}

export interface IGeolocusContext {
  getUUID(): string
  getObjectByObjectUUID(uuid: string): TGeolocusObject | undefined
  getObjectMap(): Map<string, TGeolocusObject>
  getRoute(): Route
  getRelation(): Relation
  getRegion(): Region
  getName(): string
  getDirectionDelta(direction: string): [number, number]
  getDistanceDelta(): number
  getSemanticDistanceMap(): TSemanticDistanceMap
  getResultGirdNum(): number
}

export type TGeolocusContext = GeolocusGlobalContext | GeolocusLocalContext

// route.ts
export interface IRouteNode {
  parent: Set<string> | null
  children: Set<string> | null
}
