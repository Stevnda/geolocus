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

test('semantic distance', () => {
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
              distance: 'N',
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
  expect(Math.abs(coord[0] - 146.4) < 1).toBeTruthy()
})

test('timedistance', () => {
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
              distance: {
                time: 10,
                rate: 10,
              },
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
                type: 'Point',
                coord: [0, 0],
              },
            ],
            relation: {
              direction: 45,
              distance: {
                time: 1 / 3,
                rate: '飞机',
              },
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

  scene.computeFuzzyPointObject('b')
  let res = scene.getComputeResult('b')
  let coord = <Position2>res?.result?.getGeometry().getCenter()
  expect(Math.abs(coord[0] - 70.2) < 1).toBeTruthy()

  scene.computeFuzzyPointObject('c')
  res = scene.getComputeResult('c')
  coord = <Position2>res?.result?.getGeometry().getCenter()
  expect(Math.abs(coord[0] - 70.2) < 1).toBeTruthy()
})
