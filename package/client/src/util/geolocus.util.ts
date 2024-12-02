/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Geolocus, geolocus, UserGeolocusTriple } from '@geolocus/core'
import { getPlaceDataByName, nominatim } from './place.plugin'

export const temp = [
  {
    role: 'default',
    origin: {
      name: '吉隆坡机场',
    },
    target: 'taiwan',
  }, // 0
  {
    role: 'default',
    origin: {
      name: '马六甲海峡',
    },
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
    target: 'taiwan',
  }, // 1
  {
    role: 'default',
    origin: {
      name: '卡里马塔海峡',
    },
    target: 'taiwan',
  }, // 2
  {
    role: 'default',
    origin: {
      name: '九段线',
    },
    relation: {
      direction: 'S',
      topology: 'disjoint',
      distance: 400000,
    },
    target: 'taiwan',
  }, // 3
  {
    role: 'default',
    origin: {
      name: '加里曼尼岛',
    },
    target: 'taiwan',
  }, // 4
  {
    role: 'default',
    origin: {
      name: '苏拉威西海',
    },
    relation: {
      direction: 'SE',
      topology: 'contain',
    },
    target: 'taiwan',
  }, // 5
  {
    role: 'default',
    origin: {
      name: '菲律宾',
    },
    relation: {
      direction: 'E',
      topology: 'disjoint',
      distance: 100000,
    },
    target: 'taiwan',
  }, // 6
  {
    role: 'default',
    origin: {
      name: '巴士海峡',
    },
    relation: {
      direction: 'W',
      topology: 'disjoint',
      distance: 150000,
    },
    target: 'taiwan',
  }, // 7
  {
    role: 'default',
    origin: {
      name: '台湾',
    },
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
    target: 'taiwan',
  }, // 8
  {
    role: 'default',
    origin: {
      name: '松山机场',
    },
    target: 'taiwan',
  }, // 9
]

export const initContext = () => {
  const geolocusContext = geolocus.createContext({
    maxDistance: 1000000,
    name: 'test',
    gridSum: 128 * 128,
    region: [
      [-99999999, -99999999],
      [99999999, -99999999],
      [99999999, 99999999],
      [-99999999, 99999999],
      [-99999999, -99999999],
    ],
    gridScale: 1000,
  })

  geolocusContext.addRole({
    name: 'default',
    directionDelta: 90,
    distanceDelta: 0.2,
    orientation: 0,
    semanticDistanceMap: {
      VN: [0, 10000],
      N: [10000, 30000],
      M: [30000, 100000],
      F: [100000, 300000],
      VF: [300000, 2000000],
    },
    weight: 1,
    spatialRef: geolocus.createSpatialRefFromEPSG(
      geolocus.generateUUID(),
      '4326',
    ),
  })

  geolocusContext.use('placePlugin', getPlaceDataByName)
  geolocusContext.use('placePlugin', nominatim)

  return geolocusContext
}

export const computePointTest = (geolocusContext: Geolocus, text: string) => {
  const tripleList = JSON.parse(text) as UserGeolocusTriple[]
  geolocusContext.defineRelation(tripleList, 'point')
  const res = geolocusContext.computeFuzzyPointObject(tripleList[0].target!)
  console.log(res)
  return res
}

export const computeLineTest = (geolocusContext: Geolocus, text: string) => {
  const tripleList = JSON.parse(text) as UserGeolocusTriple[]
  geolocusContext.defineRelation(tripleList, 'line')
  const res = geolocusContext.computeFuzzyLineObject(tripleList[0].target!)
  console.log(res)
  return res
}

export const computePolygonTest = (geolocusContext: Geolocus, text: string) => {
  const tripleList = JSON.parse(text) as UserGeolocusTriple[]
  geolocusContext.defineRelation(tripleList, 'polygon')
  const res = geolocusContext.computeFuzzyPolygonObject(tripleList[0].target!)
  console.log(res)
  return res
}
