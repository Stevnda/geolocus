import jsts from '@geolocus/jsts'
import { GeolocusGeometryType, GeolocusBBox, Position2 } from './object.type'
import { GeolocusGeometryMeta } from './geometry.action'

interface GeolocusGeometryProps {
  setType(value: GeolocusGeometryType): void
  getType(): GeolocusGeometryType
  setGeometry(value: jsts.geom.Geometry): void
  getGeometry(): jsts.geom.Geometry
  setBBox(value: GeolocusBBox): void
  getBBox(): GeolocusBBox
  setCenter(value: Position2): void
  getCenter(): Position2
}

export class GeolocusGeometry implements GeolocusGeometryProps {
  private _type: GeolocusGeometryType
  private _geometry: jsts.geom.Geometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(type: GeolocusGeometryType, geometry: jsts.geom.Geometry) {
    this._type = type
    this._geometry = geometry
    this._bbox = GeolocusGeometryMeta.getBBox(geometry)
    this._center = GeolocusGeometryMeta.getCenter(geometry)
  }

  setType(value: GeolocusGeometryType): void {
    this._type = value
  }

  getType(): GeolocusGeometryType {
    return this._type
  }

  setGeometry(value: jsts.geom.Geometry): void {
    this._geometry = value
  }

  getGeometry(): jsts.geom.Geometry {
    return this._geometry
  }

  setBBox(value: GeolocusBBox): void {
    this._bbox = value
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  setCenter(value: Position2): void {
    this._center = value
  }

  getCenter(): Position2 {
    return this._center
  }
}
