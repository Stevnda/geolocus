import { GeolocusGeometryType, Position2 } from '@/object'

export type GeolocusPlugin = 'place'

export interface PlacePluginOutput {
  type: GeolocusGeometryType
  coord: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export type PlacePlugin = (name: string) => PlacePluginOutput
