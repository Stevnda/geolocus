import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { Position2 } from '@/object'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
})

test('simple direction and distance', () => {
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
              direction: 45,
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
  const coord = <Position2>res?.result?.getGeometry().getCenter()
  expect(Math.abs(coord[0] - 70.2) < 1).toBeTruthy()
})

test('two direction and distance, SemanticDirection', () => {
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
                name: 'a',
              },
            ],
            relation: {
              direction: 'E',
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
  const coord = <Position2>res?.result?.getGeometry().getCenter()
  expect(Math.abs(coord[0] - 69.6) < 1).toBeTruthy()
})
