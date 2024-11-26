import { generateUUID, GeolocusGrid, Grid } from '@/util'
import jsts from '@geolocus/jsts'
import { GeolocusGeometry, JTSGeometryFactory } from './geometry'

interface GeolocusObjectProps {
  name?: string | null // 默认值 null
  templateName?: string | null // 默认值 null
  status?: 'fuzzy' | 'precise' // 默认值 precise
  infinity?: boolean // 默认值 false
}

export class GeolocusObject {
  private _uuid: string
  private _name: string | null
  private _templateName: string | null
  private _status: 'fuzzy' | 'precise'
  private _geometry: GeolocusGeometry
  private _infinity: boolean // 用于判断该对象是否通过无线距离生成

  constructor(geometry: GeolocusGeometry, init?: GeolocusObjectProps) {
    this._uuid = generateUUID()
    this._geometry = geometry
    this._name = init?.name || null
    this._templateName = init?.templateName || null
    this._status = init?.status || 'precise'
    this._infinity = init?.infinity || false
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

  getTemplateName(): string | null {
    return this._templateName
  }

  setTemplateName(value: string | null) {
    this._templateName = value
  }

  setGeometry(geometry: GeolocusGeometry): void {
    this._geometry = geometry
  }

  getGeometry(): GeolocusGeometry {
    return this._geometry
  }

  getInfinity(): boolean {
    return this._infinity
  }

  setInfinity(value: boolean): void {
    this._infinity = value
  }
}

export const computeGeolocusObjectMaskGrid = (object: GeolocusObject, gridSum: number): GeolocusGrid => {
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

  const mask = Grid.createGridWithFilter(Math.ceil(dy / gridSize), Math.ceil(dx / gridSize), (row, col) => {
    const tempPoint = JTSGeometryFactory.point([xStart + col * gridSize, yStart + row * gridSize])
    const result = jsts.operation.distance.DistanceOp.distance(geometry.getGeometry(), tempPoint) === 0
    return +result
  })

  return mask
}
