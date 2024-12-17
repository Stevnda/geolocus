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
                name: 'b',
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
    'point',
  )

  scene.computeFuzzyPointObject('c')
  const res = scene.getComputeResult('c')
  const coord = <Position2>res?.result?.getGeometry().getCenter()
  expect(Math.abs(coord[0] - 168) < 1).toBeTruthy()
})

test('circle relation', () => {
  const defineRelation = () => {
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
                  name: 'c',
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
          target: 'd',
        },
        {
          tupleList: [
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
            },
          ],
          role: 'test',
          target: 'c',
        },
      ],
      'point',
    )
  }
  expect(() => defineRelation()).toThrowError()
})
