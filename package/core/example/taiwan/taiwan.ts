import { geolocus } from '@/index'
import { GeoJson } from '@/object'
import { createWriteStream } from 'fs'
import { getPlaceDataByName } from './place.plugin'

const context = geolocus.createContext({
  maxDistance: 1000000,
  name: 'test',
  gridSize: 64 * 64,
})

context.addRole({
  name: 'test',
  directionDelta: Math.PI / 4,
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
})

context.use('place', getPlaceDataByName)

const res = context.computeFuzzyLineObject('taiwan', [
  {
    role: 'test',
    mode: 'from',
    name: '吉隆坡机场',
  },
  {
    role: 'test',
    mode: 'to',
    name: '马六甲海峡',
    relation: {
      direction: 'E',
      topology: 'intersect',
      distance: 'VN',
    },
  },
  {
    role: 'test',
    mode: 'across',
    name: '卡里马塔海峡',
  },
  {
    role: 'test',
    mode: 'along',
    name: '九段线',
    relation: {
      direction: 'S',
      topology: 'disjoint',
      distance: 400000,
    },
  },
  {
    role: 'test',
    mode: 'across',
    name: '加里曼尼岛',
  },
  {
    role: 'test',
    mode: 'across',
    name: '苏拉威西海',
    relation: {
      direction: 'SE',
      topology: 'intersect',
      distance: 'VN',
    },
  },
  {
    role: 'test',
    mode: 'across',
    name: '菲律宾',
    relation: {
      direction: 'E',
      topology: 'disjoint',
      distance: 100,
    },
  },
  {
    role: 'test',
    mode: 'across',
    name: '巴士海峡',
    relation: {
      direction: 'W',
      topology: 'disjoint',
      distance: 150,
    },
  },
  {
    role: 'test',
    mode: 'across',
    name: '台湾',
    relation: {
      direction: 'E',
      topology: 'intersect',
      distance: 'VN',
    },
  },
  {
    role: 'test',
    mode: 'to',
    name: '松山机场',
  },
])

console.log('finish')

createWriteStream(
  'D:/project/geolocus/package/core/example/taiwan/taiwan.geojson',
  'utf-8',
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
).write(JSON.stringify(GeoJson.stringify(res.getGeometry())))
