import type {
  UserGeoRelation as CoreUserGeoRelation,
  UserGeolocusTriple as CoreUserGeolocusTriple,
  UserGeolocusTripleOrigin as CoreUserGeolocusTripleOrigin,
} from '@geolocus/core'

import type { ToolUserGeolocusTriple } from './schemas.js'

function toCoreOrigin(
  origin: Exclude<
    ToolUserGeolocusTriple['tupleList'][number]['originList'],
    undefined
  >[number],
): CoreUserGeolocusTripleOrigin | CoreUserGeolocusTriple {
  if ('target' in origin) return toCoreTriple(origin)
  return origin
}

export function toCoreTriple(
  triple: ToolUserGeolocusTriple,
): CoreUserGeolocusTriple {
  return {
    role: triple.role,
    target: triple.target,
    tupleList: triple.tupleList.map((tuple) => ({
      originList: tuple.originList?.map(toCoreOrigin),
      relation: tuple.relation as CoreUserGeoRelation,
    })),
  }
}
