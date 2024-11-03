import { GeolocusObject, GeolocusGeometryType, Position2 } from '@/object'

export interface PlaceOutput {
  object?: GeolocusObject
  type?: GeolocusGeometryType
  coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export type PlacePlugin = (name: string) => PlaceOutput | null
