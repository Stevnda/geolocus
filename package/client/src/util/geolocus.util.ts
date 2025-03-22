/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Geolocus, geolocus, UserGeolocusTriple } from '@geolocus/core'
import { getPlaceDataByName } from './place.plugin'

export const initContext = () => {
  const geolocusContext = geolocus.createContext({
    maxDistance: 1000000,
    name: '测试上下文',
    gridSum: 256 * 256,
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
    directionDelta: 20,
    distanceDelta: 0.2,
    orientation: 0,
    timeDistanceMap: new Map([
      ['飞机', 300],
      ['步行', 1.67],
    ]),
    semanticDistanceMap: {
      VN: [0, 100],
      N: [0, 200],
      M: [300, 1000],
      F: [1000, 3000],
      VF: [3000, 20000],
    },
    weight: 1,
    spatialRef: geolocus.createSpatialRefFromEPSG(
      geolocus.generateUUID(),
      '4326',
    ),
  })

  geolocusContext.use('placePlugin', getPlaceDataByName)
  // geolocusContext.use('placePlugin', nominatim)

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
