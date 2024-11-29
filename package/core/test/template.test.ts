import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { TemplateNode, Template, TemplateAction } from '@/context'
import { GeolocusObject, Position2 } from '@/object'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
})

test('1-n', () => {
  const soccerGoal = new TemplateNode('足球门', 'Polygon', [
    [
      [0, 0],
      [0, 2],
      [1, 2],
      [1, 0],
      [0, 0],
    ],
  ])
  const basketballCourt = new TemplateNode('篮球场', 'Polygon', [
    [
      [0, 0],
      [0, 30],
      [30, 30],
      [30, 0],
      [0, 0],
    ],
  ])
  const soccerCourt = new TemplateNode('足球场', 'Polygon', [
    [
      [0, 0],
      [0, 30],
      [30, 30],
      [30, 0],
      [0, 0],
    ],
  ])
  const sportsFiled = new TemplateNode('运动场', 'Polygon', [
    [
      [0, 0],
      [0, 50],
      [100, 50],
      [100, 0],
      [0, 0],
    ],
  ])

  const template = new Template(scene.getContext())
  const nodeList = template.getNodeList()
  nodeList.set('足球门', soccerGoal)
  nodeList.set('篮球场', basketballCourt)
  nodeList.set('足球场', soccerCourt)
  nodeList.set('运动场', sportsFiled)

  sportsFiled.setRuleList([
    {
      templateNodeName: '足球场',
      bboxRule: {
        type: 'relative',
        offset: [-0.5, 0],
      },
    },
    {
      templateNodeName: '篮球场',
      bboxRule: {
        type: 'relative',
        offset: [0.5, 0],
      },
    },
  ])

  soccerCourt.setRuleList([
    {
      templateNodeName: '足球门',
      bboxRule: {
        type: 'relative',
        offset: [0, 0.5],
      },
    },
    {
      templateNodeName: '足球门',
      relationRule: {
        direction: 'E',
        distance: 15,
      },
    },
  ])
  TemplateAction.createObjectByTemplate(
    scene.getContext(),
    template,
    '运动场',
    [0, 0],
  )

  scene.defineRelation(
    [
      {
        originList: [
          {
            name: '运动场篮球场',
          },
        ],
        relation: {
          direction: 0,
          distance: 100,
          topology: 'disjoint',
        },
        role: 'test',
        target: 'a',
      },
    ],
    'point',
  )
  const center = <Position2>(
    scene.computeFuzzyPointObject('a')?.result?.getGeometry().getCenter()
  ) // [ 23.382361147149695, 114.55367398906374 ]
  expect(
    center[0] >= 23.3 &&
      center[0] <= 23.4 &&
      center[1] >= 114.5 &&
      center[1] <= 114.6,
  ).toBeTruthy()

  const context = scene.getContext()
  const route = context.getRoute()
  const objectMap = context.getObjectMap()
  const objectNameList = Array.from(objectMap.getNameMap().keys()).sort()
  expect(objectNameList).toEqual([
    'a',
    '运动场',
    '运动场篮球场',
    '运动场足球场',
    '运动场足球场足球门',
  ])
  expect(route.getNodeList().size).toEqual(7)
  expect(
    (() => {
      const nameMap = objectMap.getNameMap()
      const sportsFiled = <GeolocusObject>(
        nameMap.get('运动场')?.values().next().value
      ) // [0, 0]
      const soccerCourt = <GeolocusObject>(
        nameMap.get('运动场足球场')?.values().next().value
      ) // [-25, 0]
      const basketballCourt = <GeolocusObject>(
        nameMap.get('运动场篮球场')?.values().next().value
      ) // [25, 0]
      const soccerGoal = Array.from(
        <SetIterator<GeolocusObject>>(
          nameMap.get('运动场足球场足球门')?.values()
        ),
      ) // [-25, 7.5], [4.930890921432788, -1.1475419665558064]

      return (
        sportsFiled.getGeometry().getCenter()[0] === 0 &&
        soccerCourt.getGeometry().getCenter()[0] === -25 &&
        basketballCourt.getGeometry().getCenter()[0] === 25 &&
        soccerGoal[0].getGeometry().getCenter()[1] === 7.5 &&
        soccerGoal[1].getGeometry().getCenter()[0] >= 4.9 &&
        soccerGoal[1].getGeometry().getCenter()[0] <= 5
      )
    })(),
  ).toBeTruthy()
})
