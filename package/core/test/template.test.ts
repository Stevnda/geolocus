import { beforeEach, expect, test } from 'vitest'
import { createTestContext } from './init'
import { Geolocus } from '@/index'
import {
  TemplateAction,
  GeolocusObject,
  TemplateRule,
  TemplateBBoxExpress,
  TemplateRelationExpress,
  GeolocusGeometry,
  JTSGeometryFactory,
} from '@/object'
import { ObjectMapAction } from '@/context'

let scene: Geolocus
beforeEach(() => {
  scene = createTestContext()
})

test('1-n', () => {
  const context = scene.getContext()
  const express0: TemplateBBoxExpress = {
    name: '足球场',
    type: 'relative',
    offset: [-0.5, 0],
    geometryType: 'Polygon',
    coordList: [
      [
        [0, 0],
        [0, 30],
        [30, 30],
        [30, 0],
        [0, 0],
      ],
    ],
  }

  const express1: TemplateRelationExpress = {
    name: '足球门',
    relation: {
      direction: 'W',
      distance: 5,
    },
    geometryType: 'Polygon',
    coordList: [
      [
        [0, 0],
        [0, 30],
        [30, 30],
        [30, 0],
        [0, 0],
      ],
    ],
  }

  const express2: TemplateRelationExpress = {
    name: '足球门',
    relation: {
      direction: 'E',
      distance: 5,
    },
    geometryType: 'Polygon',
    coordList: [
      [
        [0, 0],
        [0, 30],
        [30, 30],
        [30, 0],
        [0, 0],
      ],
    ],
  }

  const express3: TemplateBBoxExpress = {
    name: '篮球场',
    type: 'relative',
    offset: [0.5, 0],
    geometryType: 'Polygon',
    coordList: [
      [
        [0, 0],
        [0, 30],
        [30, 30],
        [30, 0],
        [0, 0],
      ],
    ],
  }

  const rule1: TemplateRule = {
    name: '运动场',
    expressList: [express0, express3],
  }

  const rule2: TemplateRule = {
    name: '足球场',
    expressList: [express1, express2],
  }

  const template = context.getTemplate()
  template.addRule(rule1.name, rule1)
  template.addRule(rule2.name, rule2)

  const sportsFiled = new GeolocusObject(
    new GeolocusGeometry(
      'Polygon',
      JTSGeometryFactory.create('Polygon', [
        [
          [0, 0],
          [0, 50],
          [100, 50],
          [100, 0],
          [0, 0],
        ],
      ]),
    ),
    {
      name: '运动场',
      type: '运动场',
    },
  )
  ObjectMapAction.addObject(context.getObjectMap(), sportsFiled)
  TemplateAction.createObjectTemplate(context, sportsFiled)

  const route = context.getRoute()
  const objectMap = context.getObjectMap()
  expect(route.getNodeList().size).toEqual(6)
  expect(
    (() => {
      const nameMap = objectMap.getNameMap()
      const sportsFiled = <GeolocusObject>(
        nameMap.get('运动场')?.values().next().value
      ) // [50, 25]
      const soccerCourt = <GeolocusObject>(
        nameMap.get('运动场足球场')?.values().next().value
      ) // [25, 25]
      const basketballCourt = <GeolocusObject>(
        nameMap.get('运动场篮球场')?.values().next().value
      ) // [75, 25]
      const soccerGoal = Array.from(
        <SetIterator<GeolocusObject>>(
          nameMap.get('运动场足球场足球门')?.values()
        ),
      ) // [20, 25], [30, 25]

      return (
        sportsFiled.getGeometry().getCenter()[0] === 50 &&
        soccerCourt.getGeometry().getCenter()[0] === 25 &&
        basketballCourt.getGeometry().getCenter()[0] === 75 &&
        Math.abs(soccerGoal[0].getGeometry().getCenter()[0] - 5) < 1 &&
        Math.abs(soccerGoal[1].getGeometry().getCenter()[0] - 45) < 1
      )
    })(),
  ).toBeTruthy()
})
