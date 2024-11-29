import { GeolocusObject, GeolocusGeometryType, Position2 } from '@/object'
import { SpatialRef } from './spatialReference'

export interface PlaceOutput {
  object?: GeolocusObject
  type?: GeolocusGeometryType
  coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export type PlacePlugin = (
  name: string,
  spatialRef: SpatialRef,
) => PlaceOutput | null
