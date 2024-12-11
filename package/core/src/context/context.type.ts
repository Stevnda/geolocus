import { GeolocusGeometryType, GeolocusObject, Position2 } from '@/object'
import { SpatialRef } from './spatialReference'

export interface GeolocusContextInit {
  maxDistance: number
  name?: string
  gridSum?: number
  region: Position2[]
  gridScale: number
}

export interface PlaceOutput {
  object?: GeolocusObject
  type?: GeolocusGeometryType
  coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export type PlacePlugin = (
  name: string,
  spatialRef: SpatialRef,
) => PlaceOutput | null
