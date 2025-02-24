/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GeolocusGeometry,
  GeolocusGeometryAction,
  GeolocusGeometryType,
  GeolocusObject,
  JTSGeometryFactory,
  Position2,
} from '@/object'
import { GeolocusContext, Role } from '../context'
import { ObjectMapAction } from '../context/objectMap'
import { generateUUID } from '@/util'
import { GeoTriple, RelationAction } from '@/relation'
import { Region } from '@/region'
import { UserGeoRelation } from '..'

export interface TemplateCustomExpress {
  name: string
  args: any[]
  fn: (
    object: GeolocusObject,
    ...args: any[]
  ) => {
    geometryType: GeolocusGeometryType
    coordList: Position2 | Position2[] | Position2[][] | Position2[][][]
  }
}

// [0, 0] => the center of the bbox
// relative, the relative position of the bbox
// [1, 1] => the top-right corner of the bbox
// [-1, -1] => the bottom-left corner of the bbox
// absolute, the absolute position of the bbox
// [dx, dy] => [0 + dx, 0 + dy]
export interface TemplateBBoxExpress {
  name: string
  type: 'absolute' | 'relative'
  offset: [number, number]
  geometryType?: GeolocusGeometryType
  coordList?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export interface TemplateRelationExpress {
  name: string
  relation: UserGeoRelation
  geometryType?: GeolocusGeometryType
  coordList?: Position2 | Position2[] | Position2[][] | Position2[][][]
}

export interface TemplateRule {
  name: string
  expressList: (
    | TemplateCustomExpress
    | TemplateBBoxExpress
    | TemplateRelationExpress
  )[]
}

export class Template {
  private _ruleMap: Map<string, TemplateRule> // ruleName - TemplateRule
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._ruleMap = new Map()
    this._context = context
  }

  addRule(uuid: string, rule: TemplateRule): void {
    this._ruleMap.set(uuid, rule)
  }

  getRule(uuid: string): TemplateRule | null {
    return this._ruleMap.get(uuid) || null
  }

  setRuleMap(value: Map<string, TemplateRule>): void {
    this._ruleMap = value
  }

  getRuleMap(): Map<string, TemplateRule> {
    return this._ruleMap
  }

  getContext(): GeolocusContext {
    return this._context
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }
}

export class TemplateAction {
  static generateTemplateName(parent: string | null, child?: string | null) {
    if (parent == null && child == null) {
      return null
    }
    if (parent != null && child != null) {
      return parent + child
    }
    if (child != null) {
      return child
    }
    return null
  }

  static createObjectTemplate(
    context: GeolocusContext,
    object: GeolocusObject,
  ): void {
    const template = context.getTemplate()
    const objectType = object.getType()
    if (objectType == null) {
      return
    }
    const templateRule = template.getRule(objectType)
    if (!templateRule) {
      return
    }

    const route = context.getRoute()
    for (const templateExpress of templateRule.expressList) {
      let res
      if (Object.prototype.hasOwnProperty.call(templateExpress, 'args')) {
        const express = <TemplateCustomExpress>templateExpress
        const { coordList, geometryType } = this.handleCustomRule(
          object,
          <TemplateCustomExpress>express,
        )
        const objectName = TemplateAction.generateTemplateName(
          object.getName(),
          express.name,
        )
        res = new GeolocusObject(
          new GeolocusGeometry(
            geometryType,
            JTSGeometryFactory.create(geometryType, coordList),
          ),
          {
            name: objectName,
            type: express.name,
          },
        )
      } else if (
        Object.prototype.hasOwnProperty.call(templateExpress, 'type')
      ) {
        const express = <TemplateBBoxExpress>templateExpress
        const { coordList, geometryType } = this.handleBBoxRule(object, express)
        const objectName = TemplateAction.generateTemplateName(
          object.getName(),
          express.name,
        )
        if (express.coordList != null && express.geometryType != null) {
          const geometry = new GeolocusGeometry(
            express.geometryType,
            JTSGeometryFactory.create(express.geometryType, express.coordList),
          )
          const templateCenter = geometry.getCenter()
          const translateGeometry = GeolocusGeometryAction.translate(
            geometry,
            coordList[0] - templateCenter[0],
            coordList[1] - templateCenter[1],
          )
          res = new GeolocusObject(translateGeometry, {
            name: objectName,
            type: express.name,
          })
        } else {
          res = new GeolocusObject(
            new GeolocusGeometry(
              geometryType,
              JTSGeometryFactory.create(geometryType, coordList),
            ),
            {
              name: objectName,
              type: express.name,
            },
          )
        }
      } else {
        const express = <TemplateRelationExpress>templateExpress
        const { coordList, geometryType } = this.handleRelationRule(
          context,
          object,
          express,
        )
        const objectName = TemplateAction.generateTemplateName(
          object.getName(),
          express.name,
        )
        if (express.coordList != null && express.geometryType != null) {
          const geometry = new GeolocusGeometry(
            express.geometryType,
            JTSGeometryFactory.create(express.geometryType, express.coordList),
          )
          const templateCenter = geometry.getCenter()
          const translateGeometry = GeolocusGeometryAction.translate(
            geometry,
            coordList[0] - templateCenter[0],
            coordList[1] - templateCenter[1],
          )
          res = new GeolocusObject(translateGeometry, {
            name: objectName,
            type: express.name,
          })
        } else {
          res = new GeolocusObject(
            new GeolocusGeometry(
              geometryType,
              JTSGeometryFactory.create(geometryType, coordList),
            ),
            {
              name: objectName,
              type: express.name,
            },
          )
        }
      }

      // add object to objectMap
      const objectMap = context.getObjectMap()
      ObjectMapAction.addObject(objectMap, res)

      // add route
      route.addEdge(object.getUUID(), res.getUUID(), 'subordination')

      // 递归处理新创建的子地理对象
      this.createObjectTemplate(context, res)
    }
  }

  private static handleCustomRule = (
    originObject: GeolocusObject,
    rule: TemplateCustomExpress,
  ): {
    geometryType: GeolocusGeometryType
    coordList: Position2 | Position2[] | Position2[][] | Position2[][][]
  } => {
    const res = rule.fn(originObject, rule.args)
    return res
  }

  private static handleBBoxRule = (
    originObject: GeolocusObject,
    rule: TemplateBBoxExpress,
  ): {
    geometryType: GeolocusGeometryType
    coordList: Position2
  } => {
    let centerCoord: Position2
    const bbox = originObject.getGeometry().getBBox()
    const xStart = bbox[0]
    const xEnd = bbox[2]
    const dx = xEnd - xStart
    const yStart = bbox[1]
    const yEnd = bbox[3]
    const dy = yEnd - yStart
    const center = [(xStart + xEnd) / 2, (yStart + yEnd) / 2]
    if (rule.type === 'relative') {
      centerCoord = [
        center[0] + (dx * rule.offset[0]) / 2,
        center[1] + (dy * rule.offset[1]) / 2,
      ]
    } else {
      centerCoord = [center[0] + rule.offset[0], center[1] + rule.offset[1]]
    }

    return {
      geometryType: 'Point',
      coordList: centerCoord,
    }
  }

  private static handleRelationRule = (
    context: GeolocusContext,
    originObject: GeolocusObject,
    rule: TemplateRelationExpress,
  ): {
    geometryType: GeolocusGeometryType
    coordList: Position2
  } => {
    const role = <Role>context.getDefaultRole()
    const relation = rule.relation
    // NOTE
    if (relation.direction === 'in') {
      relation.direction = originObject.getOrientation()
    } else if (relation.direction === 'out') {
      relation.direction =
        (originObject.getOrientation() + Math.PI) % (2 * Math.PI)
    }
    const transformRelation = RelationAction.transform(relation, role, 'point')
    const point = new GeolocusObject(
      new GeolocusGeometry('Point', JTSGeometryFactory.empty('Point')),
      {
        status: 'fuzzy',
      },
    )
    // add temp objectMap, route and triple
    const objectMap = context.getObjectMap()
    ObjectMapAction.addObject(objectMap, point)
    const route = context.getRoute()
    route.addEdge(originObject.getUUID(), point.getUUID(), 'calculation')
    const tripleListMap = context.getRelation().getTripleListMap()
    const triple: GeoTriple = {
      originUUIDList: [originObject.getUUID()],
      relation: transformRelation,
      role,
      targetUUID: point.getUUID(),
      uuid: generateUUID(),
    }
    tripleListMap.set(point.getUUID(), new Set([triple]))

    // compute coord
    const res = Region.computeFuzzyPointObject(point.getUUID(), context)
    const centerCoord = <Position2>res.result?.getGeometry().getCenter()

    // remove temp route and triple
    ObjectMapAction.deleteObject(objectMap, point)
    route.removeEdge(originObject.getUUID(), point.getUUID())
    tripleListMap.delete(point.getUUID())
    context.getResultMap().delete(point.getUUID())

    return {
      geometryType: 'Point',
      coordList: centerCoord,
    }
  }
}
