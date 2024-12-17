import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { Position2 } from '@/object'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
})

test('test orientation', () => {
  scene
    .getContext()
    .getRoleByName('test')
    ?.setOrientation(Math.PI / 4)
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
              direction: 'F',
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
