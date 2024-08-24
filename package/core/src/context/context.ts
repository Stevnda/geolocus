import { GeolocusObject } from '@/object'
import { Route } from './route.actor'
import { Role } from './role.actor'
import { randomUUID } from 'crypto'

interface GeolocusContextProps {
  setUUID(value: string): void
  getUUID(): string
  setName(value: string): void
  getName(): string
  setObjectMap(value: Map<string, GeolocusObject>): void
  getObjectMap(): Map<string, GeolocusObject>
  getObjectByObjectUUID(uuid: string): GeolocusObject | null
  setRoute(value: Route): void
  getRoute(): Route
  setRoleMap(value: Map<string, Role>): void
  getRoleMap(): Map<string, Role>
  setGridSize(value: number): void
  getGridSize(): number
}

interface GeolocusContextInit {
  name?: string
  gridSize?: number
}

export class GeolocusContext implements GeolocusContextProps {
  private _uuid: string
  private _name: string
  private _roleList: Map<string, Role>
  private _objectMap: Map<string, GeolocusObject>
  private _route: Route
  private _roleMap: Map<string, Role>
  private _gridSize: number

  constructor(init: GeolocusContextInit) {
    this._uuid = randomUUID()
    this._name = init.name || 'default'
    this._roleList = new Map()
    this._objectMap = new Map()
    this._route = new Route(this)
    this._roleMap = new Map()
    this._gridSize = init.gridSize || 128
  }

  setUUID(value: string): void {
    this._uuid = value
  }

  getUUID(): string {
    return this._uuid
  }

  setName(value: string): void {
    this._name = value
  }

  getName(): string {
    return this._name
  }

  setObjectMap(value: Map<string, GeolocusObject>): void {
    this._objectMap = value
  }

  getObjectMap(): Map<string, GeolocusObject> {
    return this._objectMap
  }

  getObjectByObjectUUID(uuid: string): GeolocusObject | null {
    return this._objectMap.get(uuid) || null
  }

  setRoute(value: Route): void {
    this._route = value
  }

  getRoute(): Route {
    return this._route
  }

  setRoleMap(value: Map<string, Role>): void {
    this._roleMap = value
  }

  getRoleMap(): Map<string, Role> {
    return this._roleMap
  }

  setGridSize(value: number): void {
    this._gridSize = value
  }

  getGridSize(): number {
    return this._gridSize
  }
}
