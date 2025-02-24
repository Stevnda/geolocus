import { generateUUID, GeolocusGrid, Grid } from '@/util'
import jsts from '@geolocus/jsts'
import { GeolocusGeometry, JTSGeometryFactory } from './geometry'

export interface GeolocusObjectInit {
  name?: string | null // 默认值 null
  type?: string | null // 默认值 null
  status?: 'fuzzy' | 'precise' // 默认值 precise
  orientation?: number | null // 默认为 0 （正北方向）, radius
}

export class GeolocusObject {
  private _uuid: string
  private _name: string | null
  private _type: string | null
  private _status: 'fuzzy' | 'precise'
  private _orientation: number
  private _geometry: GeolocusGeometry
  private _props: Record<string, unknown>

  constructor(
    geometry: GeolocusGeometry,
    init?: GeolocusObjectInit, // useful props
    props?: Record<string, unknown>, // temp props
  ) {
    this._uuid = generateUUID()
    this._geometry = geometry
    this._name = init?.name || null
    this._type = init?.type || null
    this._status = init?.status || 'precise'
    this._orientation = init?.orientation || 0
    this._props = props || {}
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  setStatus(value: 'fuzzy' | 'precise'): void {
    this._status = value
  }

  getStatus(): 'fuzzy' | 'precise' {
    return this._status
  }

  setName(value: string | null): void {
    this._name = value
  }

  getName(): string | null {
    return this._name
  }

  getType(): string | null {
    return this._type
  }

  setType(value: string | null) {
    this._type = value
  }

  setOrientation(value: number): void {
    this._orientation = value
  }

  getOrientation(): number {
    return this._orientation
  }

  setGeometry(geometry: GeolocusGeometry): void {
    this._geometry = geometry
  }

  getGeometry(): GeolocusGeometry {
    return this._geometry
  }

  getProps(): Record<string, unknown> {
    return this._props
  }

  setProps(value: Record<string, unknown>): void {
    this._props = value
  }

  addProp(key: string, value: unknown): void {
    this._props[key] = value
  }

  getProp(key: string): unknown {
    return this._props[key]
  }
}

export const computeGeolocusObjectMaskGrid = (
  object: GeolocusObject,
  gridSum: number,
): GeolocusGrid => {
  const bbox = object.getGeometry().getBBox()
  const xStart = bbox[0]
  const xEnd = bbox[2]
  const dx = xEnd - xStart
  const yStart = bbox[1]
  const yEnd = bbox[3]
  const dy = yEnd - yStart
  const ratio = dy / dx
  const gridSize = dx / Math.sqrt(gridSum / ratio)
  const geometry = object.getGeometry()

  const mask = Grid.createGridWithFilter(
    Math.ceil(dy / gridSize),
    Math.ceil(dx / gridSize),
    (row, col) => {
      const tempPoint = JTSGeometryFactory.point([
        xStart + col * gridSize,
        yStart + row * gridSize,
      ])
      const result =
        jsts.operation.distance.DistanceOp.distance(
          geometry.getGeometry(),
          tempPoint,
        ) === 0
      return +result
    },
  )

  return mask
}
