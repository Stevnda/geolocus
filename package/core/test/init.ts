import { createSpatialRefFromEPSG } from '@/context'
import { geolocus } from '@/index'
import { generateUUID, GEO_MAX_VALUE } from '@/util'

export const createTestContext = () => {
  const context = geolocus.createContext({
    maxDistance: 1000000,
    name: 'test',
    gridSum: 128 * 128,
    region: [
      [-GEO_MAX_VALUE, -GEO_MAX_VALUE],
      [GEO_MAX_VALUE, -GEO_MAX_VALUE],
      [GEO_MAX_VALUE, GEO_MAX_VALUE],
      [-GEO_MAX_VALUE, GEO_MAX_VALUE],
      [-GEO_MAX_VALUE, -GEO_MAX_VALUE],
    ],
    gridScale: 1000,
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
    spatialRef: createSpatialRefFromEPSG(generateUUID(), '4326'),
  })

  return context
}
