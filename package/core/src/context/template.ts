import {
  GeolocusGeometry,
  GeolocusGeometryAction,
  GeolocusGeometryType,
  GeolocusObject,
  JTSGeometryFactory,
  Position2,
} from '@/object'
import { GeolocusContext } from '.'
import { ObjectMapAction } from './objectMap'
import { RouteNode } from './route'
import { generateUUID } from '@/util'

type TemplateCustomRule = (object: GeolocusObject) => Position2

interface TemplateBBoxRule {
  type: 'absolute' | 'relative'
  // [0, 0] => the center of the bbox
  // relative, the relative position of the bbox
  // [1, 1] => the top-right corner of the bbox
  // [-1, -1] => the bottom-left corner of the bbox
  // absolute, the absolute position of the bbox
  // [dx, dy] => [0 + dx, 0 + dy]
  offset: [number, number]
}

interface TemplateRule {
  templateNodeName: string
  // 优先级: custom > bbox, 只能执行一个规则
  customRule?: TemplateCustomRule
  bboxRule?: TemplateBBoxRule
}

type LevelName = { level: number; name: string }[]

// createObject By template
export class TemplateNode {
  private _uuid: string
  private _name: string
  private _geometryType: GeolocusGeometryType
  private _coordList: Position2 | Position2[] | Position2[][] | Position2[][][]
  private _ruleList: TemplateRule[]

  constructor(
    name: string,
    geometryType: GeolocusGeometryType,
    coord: Position2 | Position2[] | Position2[][] | Position2[][][],
    ruleList?: TemplateRule[],
  ) {
    this._uuid = generateUUID()
    this._name = name
    this._geometryType = geometryType
    this._coordList = coord
    this._ruleList = ruleList || []
  }

  getUUID(): string {
    return this._uuid
  }

  setUuid(uuid: string): void {
    this._uuid = uuid
  }

  getName(): string {
    return this._name
  }

  setName(name: string): void {
    this._name = name
  }

  getGeometryType(): GeolocusGeometryType {
    return this._geometryType
  }

  setGeometryType(geometryType: GeolocusGeometryType): void {
    this._geometryType = geometryType
  }

  getCoordList(): Position2 | Position2[] | Position2[][] | Position2[][][] {
    return this._coordList
  }

  setCoordList(coord: Position2 | Position2[] | Position2[][] | Position2[][][]): void {
    this._coordList = coord
  }

  getRuleList(): TemplateRule[] {
    return this._ruleList
  }

  setRuleList(ruleList: TemplateRule[]): void {
    this._ruleList = ruleList
  }
}

export class Template {
  private _nodeList: Map<string, TemplateNode> // name - templateNode
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._nodeList = new Map()
    this._context = context
  }

  setNodeList(value: Map<string, TemplateNode>): void {
    this._nodeList = value
  }

  getNodeList(): Map<string, TemplateNode> {
    return this._nodeList
  }

  getNodeByName(templateName: string): TemplateNode | null {
    return this._nodeList.get(templateName) || null
  }

  getContext(): GeolocusContext {
    return this._context
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }
}

export class TemplateAction {
  static generateTemplateName(levelName: LevelName) {
    levelName.sort((a, b) => a.level - b.level)
    const name = levelName
      .filter((value) => value.level !== 0)
      .map((value) => value.name)
      .join('')
    return name
  }

  static createObjectByTemplate(
    context: GeolocusContext,
    template: Template,
    templateName: string,
    centerCoord: Position2,
    levelName?: LevelName,
    parentObject?: GeolocusObject,
  ): void {
    const templateNode = template.getNodeByName(templateName)
    if (!templateNode) {
      throw new Error(`Template ${templateName} not found`)
    }

    // const name = TemplateAction.generateTemplateName(levelName)
    const geometryType = templateNode.getGeometryType()
    const coordList = templateNode.getCoordList()
    // TODO 这里有问题, 现在 levelName 默认是一对多关系, 多对多必有 bug
    const route = context.getRoute()
    // levelName 的初始化
    if (levelName == null) {
      if (parentObject != null) {
        const routeNode = <RouteNode>route.getNodeByUUID(parentObject.getUUID())
        levelName = [{ level: routeNode.getLevel(), name: <string>parentObject.getName() }]
      } else {
        levelName = [{ level: 0, name: 'root' }]
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    levelName.push({ level: levelName.at(-1)!.level + 1, name: templateNode.getName() })
    const name = TemplateAction.generateTemplateName(levelName)
    let geometry = new GeolocusGeometry(geometryType, JTSGeometryFactory.create(geometryType, coordList))
    if (centerCoord != null) {
      const templateCenter = geometry.getCenter()
      geometry = GeolocusGeometryAction.translate(
        geometry,
        centerCoord[0] - templateCenter[0],
        centerCoord[1] - templateCenter[1],
      )
    }
    const object = new GeolocusObject(geometry, name, templateName, 'precise')

    // add object to objectMap
    const objectMap = context.getObjectMap()
    ObjectMapAction.addObject(objectMap, object)

    // add route
    if (parentObject) route.addEdge(parentObject.getUUID(), object.getUUID())
    else route.addEdge('root', object.getUUID())

    // handle rule
    const ruleList = templateNode.getRuleList()
    if (ruleList.length === 0) return
    for (const rule of ruleList) {
      if (rule.customRule != null) {
        this.handleCustomRule(context, template, object, rule.templateNodeName, [...levelName], rule.customRule)
      } else {
        this.handleBBoxRule(
          context,
          template,
          object,
          rule.templateNodeName,
          [...levelName],
          <TemplateBBoxRule>rule.bboxRule,
        )
      }
    }
  }

  private static handleCustomRule = (
    context: GeolocusContext,
    template: Template,
    originObject: GeolocusObject,
    childTemplateNodeName: string,
    levelName: LevelName,
    rule: TemplateCustomRule,
  ) => {
    const centerCoord = rule(originObject)
    this.createObjectByTemplate(context, template, childTemplateNodeName, centerCoord, levelName, originObject)
  }

  private static handleBBoxRule = (
    context: GeolocusContext,
    template: Template,
    originObject: GeolocusObject,
    childTemplateNodeName: string,
    levelName: LevelName,
    rule: TemplateBBoxRule,
  ) => {
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
      centerCoord = [center[0] + (dx * rule.offset[0]) / 2, center[1] + (dy * rule.offset[1]) / 2]
    } else {
      centerCoord = [center[0] + rule.offset[0], center[1] + rule.offset[1]]
    }
    this.createObjectByTemplate(context, template, childTemplateNodeName, centerCoord, levelName, originObject)
  }
}
