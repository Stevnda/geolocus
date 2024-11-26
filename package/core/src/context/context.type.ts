import { Position2 } from '@/object'

export interface GeolocusContextInit {
  maxDistance: number
  name?: string
  gridSum?: number
  region: Position2[]
  gridScale: number
}
