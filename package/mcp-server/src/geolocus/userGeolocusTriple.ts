export type GeolocusGeometryType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'

export type Position2 = [number, number]

export type UserGeoRelation = {
  topology?: 'disjoint' | 'contain' | 'within' | 'intersect' | 'along'
  direction?: string | number
  distance?:
    | number
    | [number, number]
    | { time: number; rate: string | number }
    | 'VN'
    | 'N'
    | 'M'
    | 'F'
    | 'VF'
  range?: 'inside' | 'outside' | 'both'
  layout?: {
    layout: 'arrangement' | 'geometry' | 'sequence' | 'custom'
    number: number
    init: JsonObject
  }
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type JsonObject = { [key: string]: JsonValue }

export type UserGeolocusTripleOrigin = {
  name?: string
  type?: GeolocusGeometryType
  coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export type UserGeolocusTriple = {
  role: string
  tupleList: Array<{
    originList?: Array<UserGeolocusTripleOrigin | UserGeolocusTriple>
    relation?: UserGeoRelation
  }>
  target: string
}
