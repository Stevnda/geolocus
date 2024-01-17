import { GeolocusObject } from '@/object'
import { IGeoTriple, IRegionPDF, IRegionResult, Region } from '@/region'
import { AbsoluteDirection, EuclideanDistanceRange, Relation } from '@/relation'
import { Route } from '../route'

export type Position2 = [number, number]
export type Position3 = [number, number, number]

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
  getObjectByObjectUUID(uuid: string): GeolocusObject | undefined
  getObjectMap(): Map<string, GeolocusObject>
  getRouteNodeByObjectUUID(uuid: string): IRouteNode
  getRouteMap(): Route
  getTripleByRelationUUID(uuid: string): IGeoTriple | undefined
  getRelationMapOfObjectByObjectUUID(
    uuid: string,
  ): Map<string, IGeoTriple> | undefined
  getRelationMap(): Relation
  getRegionResultByObjectUUID(uuid: string): IRegionResult | undefined
  getPdfOfTripleByRelationUUID(uuid: string): IRegionPDF | undefined
  getRegion(): Region
  getName(): string
  getDirectionDelta(): DirectionDelta
  getDistanceDelta(): number
  getSemanticDistanceMap(): SemanticDistanceMap
  getResultGirdNum(): number
}

export interface IRouteNode {
  parent?: Set<string>
  children?: Set<string>
}
