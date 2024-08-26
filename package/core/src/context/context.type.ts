import { AbsoluteDirection } from '@/relation'

export interface RouteNode {
  parent: Set<string> | null
  children: Set<string> | null
}

export type DirectionDelta = {
  [props in AbsoluteDirection]: [number, number]
}

export interface GeolocusContextInit {
  maxDistance: number
  name?: string
  gridSize?: number
}
