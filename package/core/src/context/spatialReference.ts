import { Position2 } from '@/object'

type SpatialRefType = 'EPSG' | 'ESRI' | 'WKT1' | 'WKT2' | 'PROJ4' | 'PROJJSON'

export class SpatialRef {
  private _uuid: string // 唯一标识
  private _type: SpatialRefType // 编码标准
  private _crs: string // 空间参考标准
  private _name: string // 空间参考名称
  private _description: string // 空间参考信息描述

  constructor(uuid: string, type: SpatialRefType, crs: string, name: string, description: string) {
    this._uuid = uuid
    this._type = type
    this._crs = crs
    this._name = name
    this._description = description
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): SpatialRefType {
    return this._type
  }

  setType(type: SpatialRefType): void {
    this._type = type
  }

  getCrs(): string {
    return this._crs
  }

  setCrs(crs: string): void {
    this._crs = crs
  }

  getName(): string {
    return this._name
  }

  setName(name: string): void {
    this._name = name
  }

  getDescription(): string {
    return this._description
  }

  setDescription(description: string): void {
    this._description = description
  }
}

// NOTE 目前只支持 4326 - 3857
export class SpatialRefAction {
  // 投影转地理
  static XYToLatlng(sp: SpatialRef, coord: Position2): Position2 {
    const crs = sp.getCrs()
    console.log(crs)

    const R2D = 180 / Math.PI
    const A = 6378137.0

    return [(coord[0] * R2D) / A, (Math.PI * 0.5 - 2.0 * Math.atan(Math.exp(-coord[1] / A))) * R2D]
  }

  // 地理转投影
  static latLngToXY(sp: SpatialRef, coord: Position2): Position2 {
    const crs = sp.getCrs()
    console.log(crs)

    const D2R = Math.PI / 180
    const A = 6378137.0
    const MAXEXTENT = 20037508.342789244
    const adjusted = Math.abs(coord[0]) <= 180 ? coord[0] : coord[0] - Math.sign(coord[0]) * 360
    const xy: Position2 = [A * adjusted * D2R, A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * coord[1] * D2R))]

    if (xy[0] > MAXEXTENT) xy[0] = MAXEXTENT
    if (xy[0] < -MAXEXTENT) xy[0] = -MAXEXTENT
    if (xy[1] > MAXEXTENT) xy[1] = MAXEXTENT
    if (xy[1] < -MAXEXTENT) xy[1] = -MAXEXTENT

    return xy
  }
}

export const createSpatialRefFromEPSG = (
  uuid: string,
  epsg: string,
  name?: string,
  description?: string,
): SpatialRef => {
  name = name || `EPSG-${epsg}`
  description = description || ''
  return new SpatialRef(uuid, 'EPSG', epsg, name, description)
}
