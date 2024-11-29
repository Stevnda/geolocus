import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { Position2 } from '@/object'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
})

test('compute order', () => {
  scene.defineRelation(
    [
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
        role: 'test',
        target: 'b',
      },
      {
        originList: [
          {
            name: 'd',
            type: 'Point',
            coord: [0, 0],
          },
        ],
        relation: {
          direction: 'E',
          distance: 100,
          topology: 'disjoint',
        },
        role: 'test',
        target: 'b',
      },
      {
        originList: [
          {
            name: 'b',
          },
        ],
        relation: {
          direction: 90,
          distance: 100,
          topology: 'disjoint',
        },
        role: 'test',
        target: 'c',
      },
    ],
    'point',
  )

  scene.computeFuzzyPointObject('c')
  const res = scene.getComputeResult('c')
  const coord = <Position2>res?.result?.getGeometry().getCenter()
  expect(
    coord[0] <= 169.5 &&
      coord[0] >= 169.4 &&
      coord[1] <= 69.6 &&
      coord[1] >= 69.5,
  ).toBe(true)
})

test('circle relation', () => {
  const defineRelation = () => {
    scene.defineRelation(
      [
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
          role: 'test',
          target: 'b',
        },
        {
          originList: [
            {
              name: 'd',
              type: 'Point',
              coord: [0, 0],
            },
          ],
          relation: {
            direction: 'E',
            distance: 100,
            topology: 'disjoint',
          },
          role: 'test',
          target: 'b',
        },
        {
          originList: [
            {
              name: 'c',
            },
          ],
          relation: {
            direction: 90,
            distance: 100,
            topology: 'disjoint',
          },
          role: 'test',
          target: 'd',
        },
        {
          originList: [
            {
              name: 'b',
            },
          ],
          relation: {
            direction: 90,
            distance: 100,
            topology: 'disjoint',
          },
          role: 'test',
          target: 'c',
        },
      ],
      'point',
    )
  }
  expect(() => defineRelation()).toThrowError()
})
