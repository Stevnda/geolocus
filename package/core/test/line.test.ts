import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { createSpatialRefFromEPSG } from '@/context'
import { generateUUID } from '@/util'
import { getPlaceDataByName } from './util/place.plugin'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
  scene.addRole({
    name: 'default',
    directionDelta: 45,
    distanceDelta: 0.2,
    orientation: 0,
    timeDistanceMap: new Map([['飞机', 300]]),
    semanticDistanceMap: {
      VN: [0, 10000],
      N: [10000, 30000],
      M: [30000, 100000],
      F: [100000, 300000],
      VF: [300000, 2000000],
    },
    weight: 1,
    spatialRef: createSpatialRefFromEPSG(generateUUID(), '4326'),
  })
  scene.use('placePlugin', getPlaceDataByName)
})

test('compute line', () => {
  scene.defineRelation(
    [
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '吉隆坡机场',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 0
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '马六甲海峡',
              },
            ],
            relation: {
              direction: 'E',
              topology: 'intersect',
            },
          },
        ],
        target: 'taiwan',
      }, // 1
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '卡里马塔海峡',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 2
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '九段线',
              },
            ],
            relation: {
              direction: 'S',
              topology: 'disjoint',
            },
          },
        ],
        target: 'taiwan',
      }, // 3
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '加里曼尼岛',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 4
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '苏拉威西海',
              },
            ],
            relation: {
              direction: 'SE',
              topology: 'contain',
            },
          },
        ],
        target: 'taiwan',
      }, // 5
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '菲律宾',
              },
            ],
            relation: {
              direction: 'E',
              topology: 'along',
              distance: 100000,
            },
          },
        ],
        target: 'taiwan',
      }, // 6
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '巴士海峡',
              },
            ],
            relation: {
              direction: 270,
              topology: 'disjoint',
              distance: 150000,
            },
          },
        ],
        target: 'taiwan',
      }, // 7
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '台湾',
              },
            ],
            relation: {
              direction: 'E',
              topology: 'intersect',
            },
          },
        ],
        target: 'taiwan',
      }, // 8
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '松山机场',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 9
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '东海岸线',
              },
            ],
            relation: {
              topology: 'toward',
              direction: 'N',
              distance: 800000,
            },
          },
        ],
        target: 'taiwan',
      }, // 10
      {
        role: 'default',
        tupleList: [
          {
            relation: {
              topology: 'toward',
              direction: 'NE',
              distance: 300000,
            },
          },
        ],
        target: 'taiwan',
      }, // 11
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '首尔',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 12
    ],
    'line',
  )
  const res = scene.computeFuzzyLineObject('taiwan')
  expect(res?.geoTripleResultList.length).toBe(13)
})

test('compute line', () => {
  scene.defineRelation(
    [
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '吉隆坡机场',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 0
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '马六甲海峡',
              },
            ],
            relation: {
              direction: 'E',
              topology: 'intersect',
            },
          },
        ],
        target: 'taiwan',
      }, // 1
      {
        role: 'default',
        tupleList: [
          {
            originList: [
              {
                name: '卡里马塔海峡',
              },
            ],
          },
        ],
        target: 'taiwan',
      }, // 2
      {
        role: 'default',
        tupleList: [
          {
            relation: {
              topology: 'toward',
              direction: 'R',
              distance: 900000,
            },
          },
        ],
        target: 'taiwan',
      }, // 3
      {
        role: 'default',
        tupleList: [
          {
            relation: {
              topology: 'toward',
              direction: 'L',
              distance: 200000,
            },
          },
        ],
        target: 'taiwan',
      }, // 4
      {
        role: 'default',
        tupleList: [
          {
            relation: {
              topology: 'toward',
              direction: '菲律宾',
              distance: 300000,
            },
          },
        ],
        target: 'taiwan',
      }, // 5
    ],
    'line',
  )
  const res = scene.computeFuzzyLineObject('taiwan')
  expect(res?.geoTripleResultList.length).toBe(6)
})
