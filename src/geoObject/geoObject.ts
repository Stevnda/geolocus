import crypto from 'crypto'
import { GeolocusGeometry } from '../geometry'
import {
  MetaInfo,
  MetaTrait,
  RouteInfo,
  RouteTrait,
  routeAction,
} from '../meta'
import { RegionInfo, RegionTrait } from '../region'

interface IGeoObjectTrait extends MetaTrait, RouteTrait, RegionTrait {
  getUUID(): string
  getType(): 'Point' | 'Line' | 'Mesh' | 'BBox'
  getGeometry(): GeolocusGeometry
  clone(): GeoObject
}

export class GeoObject implements IGeoObjectTrait {
  private _type: 'Point' | 'Line' | 'Mesh' | 'BBox'
  private _uuid: string
  private _geometry: GeolocusGeometry
  private _route: RouteInfo
  private _meta: MetaInfo
  private _region: RegionInfo

  constructor(geometry: GeolocusGeometry) {
    this._type = geometry.getType()
    this._uuid = crypto.randomUUID()
    this._geometry = geometry
    this._route = new RouteInfo()
    this._meta = new MetaInfo()
    this._region = new RegionInfo()
  }

  getUUID(): string {
    return this._uuid
  }

  getType(): 'Point' | 'Line' | 'Mesh' | 'BBox' {
    return this._type
  }

  getGeometry(): GeolocusGeometry {
    return this._geometry
  }

  getRoute(): RouteInfo {
    return this._route
  }

  setRoute(route: RouteInfo): void {
    this._route = route
  }

  getParent(): Set<string> {
    return this._route.getParent()
  }

  setParent(parent: Set<string>): void {
    this._route.setParent(parent)
  }

  addParent(geoObjectUUID: string): void {
    routeAction.addParent(this._route, geoObjectUUID)
  }

  deleteParent(geoObjectUUID: string): boolean {
    return routeAction.deleteParent(this._route, geoObjectUUID)
  }

  clearParent(): void {
    routeAction.clearParent(this._route)
  }

  isParentOf(geoObjectUUID: string): boolean {
    return routeAction.isParentOf(this._route, geoObjectUUID)
  }

  getChildren(): Set<string> {
    return this._route.getChildren()
  }

  setChildren(children: Set<string>): void {
    this._route.setChildren(children)
  }

  addChildren(geoObjectUUID: string): void {
    routeAction.addChildren(this._route, geoObjectUUID)
  }

  deleteChildren(geoObjectUUID: string): boolean {
    return routeAction.deleteChildren(this._route, geoObjectUUID)
  }

  clearChildren(): void {
    routeAction.clearChildren(this._route)
  }

  isChildrenOf(geoObjectUUID: string): boolean {
    return routeAction.isChildrenOf(this._route, geoObjectUUID)
  }

  getMeta(): MetaInfo {
    return this._meta
  }

  getRegion(): RegionInfo {
    return this._region
  }

  clone(): GeoObject {
    const bbox = new GeoObject(this._geometry.clone())
    return bbox
  }
}
