import { GeolocusGeometry, GeolocusGeometryType, GeolocusObject, JTSGeometryFactory, Position2 } from '@/object'
import { GeoRelation } from '@/relation'
import { generateUUID } from '@/util'

interface TemplateRule {
  nodeUUID: string
  customRule?: string
  bboxRule?: {
    type: 'absolute' | 'relative'
    // [0, 0] => the center of the bbox
    // relative, the relative position of the bbox
    // [1, 1] => the top-right corner of the bbox
    // [-1, -1] => the bottom-left corner of the bbox
    // absolute, the absolute position of the bbox
    // [dx, dy] => [0 + dx, 0 + dy]
    offset: [number, number]
  }
  relationRule?: GeoRelation
}

// createObject By template
export class TemplateNode {
  private _uuid: string
  private _name: string
  private _object: GeolocusObject
  private _ruleList: TemplateRule[]

  constructor(
    name: string,
    geometryType: GeolocusGeometryType,
    coord: Position2 | Position2[] | Position2[][] | Position2[][][],
    ruleList?: TemplateRule[],
  ) {
    this._uuid = generateUUID()
    this._name = name
    this._object = new GeolocusObject(
      new GeolocusGeometry(geometryType, JTSGeometryFactory.create(geometryType, coord)),
    )
    this._ruleList = ruleList || []
  }

  getUuid(): string {
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

  getObject(): GeolocusObject {
    return this._object
  }

  setObject(object: GeolocusObject): void {
    this._object = object
  }

  getRuleList(): TemplateRule[] {
    return this._ruleList
  }

  setRuleList(ruleList: TemplateRule[]): void {
    this._ruleList = ruleList
  }
}

export class TemplateAction {
  //
}
