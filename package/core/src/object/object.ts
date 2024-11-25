import { generateUUID, GeolocusGird, Gird } from '@/util'
import jsts from '@geolocus/jsts'
import { GeolocusGeometry, JTSGeometryFactory } from './geometry'

export class GeolocusObject {
  private _uuid: string
  private _name: string | null
  private _templateName: string | null
  private _status: 'fuzzy' | 'precise'
  private _geometry: GeolocusGeometry

  constructor(
    geometry: GeolocusGeometry,
    name: string | null = null,
    templateName: string | null = null,
    status: 'fuzzy' | 'precise' = 'precise',
  ) {
    this._uuid = generateUUID()
    this._status = status
    this._name = name
    this._templateName = templateName
    this._geometry = geometry
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
}

export const computeGeolocusObjectMaskGrid = (object: GeolocusObject, girdSum: number): GeolocusGird => {
  const bbox = object.getGeometry().getBBox()
  const xStart = bbox[0]
  const xEnd = bbox[2]
  const dx = xEnd - xStart
  const yStart = bbox[1]
  const yEnd = bbox[3]
  const dy = yEnd - yStart
  const ratio = dy / dx
  const girdSize = dx / Math.sqrt(girdSum / ratio)
  const geometry = object.getGeometry()

  const mask = Gird.createGirdWithFilter(Math.ceil(dy / girdSize), Math.ceil(dx / girdSize), (row, col) => {
    const tempPoint = JTSGeometryFactory.point([xStart + col * girdSize, yStart + row * girdSize])
    const result = jsts.operation.distance.DistanceOp.distance(geometry.getGeometry(), tempPoint) === 0
    return +result
  })

  return mask
}
