import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import { TemplateNode, Template, TemplateAction } from '@/context'

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
      bboxRule: {
        type: 'relative',
        offset: [0, -0.5],
      },
    },
  ])

  TemplateAction.createObjectByTemplate(scene.getContext(), template, '运动场', [0, 0])
  const context = scene.getContext()
  const route = context.getRoute()
  const objectMap = context.getObjectMap()
  const objectNameList = Array.from(objectMap.getNameMap().keys()).sort()
  expect(objectNameList).toEqual(['运动场', '运动场篮球场', '运动场足球场', '运动场足球场足球门'])
  expect(route.getNodeList().size).toEqual(6)
})
