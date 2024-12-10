import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { Position2 } from '@/object'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
})

test('origin is geoTriple', () => {
  scene.defineRelation(
    [
      {
        tupleList: [
          {
            originList: [
              {
                name: 'a',
                type: 'Point',
                coord: [0, 0],
              },
            ],
            relation: {
              direction: 0,
              distance: 100,
              topology: 'disjoint',
            },
          },
        ],
        role: 'test',
        target: 'b',
      },
      {
        tupleList: [
          {
            originList: [
              {
                tupleList: [
                  {
                    originList: [
                      {
                        name: 'a',
                        type: 'Point',
                        coord: [0, 0],
                      },
                    ],
                    relation: {
                      direction: 90,
                      distance: 100,
                      topology: 'disjoint',
                    },
                  },
                ],
                role: 'test',
                target: 'c',
              },
            ],
            relation: {
              direction: 0,
              distance: 100,
              topology: 'disjoint',
            },
          },
        ],
        role: 'test',
        target: 'b',
      },
    ],
    'point',
  )

  scene.computeFuzzyPointObject('b')
  const res = scene.getComputeResult('b')
  const coord = <Position2>res?.result?.getGeometry().getCenter() // 50.44 87.73
  expect(
    coord[0] <= 50.5 &&
      coord[0] >= 50.3 &&
      coord[1] <= 87.8 &&
      coord[1] >= 87.7,
  ).toBeTruthy()
})
