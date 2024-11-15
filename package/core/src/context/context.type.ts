import { Position2 } from '@/object'

export interface RouteNode {
  parent: Set<string> | null
  children: Set<string> | null
}

export interface GeolocusContextInit {
  maxDistance: number
  name?: string
  gridSize?: number
  region: Position2[]
}
