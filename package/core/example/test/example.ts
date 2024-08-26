import { geolocus } from '@/index'
import { GeoJson } from '@/object'
import { createWriteStream } from 'fs'

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
    VN: [0, 100],
    N: [100, 300],
    M: [300, 1000],
    F: [1000, 3000],
    VF: [3000, 20000],
  },
  weight: 1,
})

context.defineRelation([
  {
    origin: {
      name: 'a',
      type: 'Polygon',
      coord: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    },
    relation: {
      direction: 'E',
      distance: 100,
      topology: 'disjoint',
    },
    role: 'test',
    target: 'b',
  },
  {
    origin: {
      name: 'a',
      type: 'Polygon',
      coord: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    },
    relation: {
      direction: 'SE',
      distance: 100,
      topology: 'disjoint',
    },
    role: 'test',
    target: 'b',
  },
])

console.time('default')
context.computeFuzzyPointObject('b')
const res = context.getComputeResult('b')
console.log(res?.coord)
console.timeEnd('default')
createWriteStream(
  'D:/project/geolocus/package/core/example/example.geojson',
  'utf-8',
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
).write(JSON.stringify(GeoJson.stringify(res!.region?.getGeometry()!)))
