import { IRoute } from './context.type'

export class Route implements IRoute {
  private _parent: Set<string>
  private _children: Set<string>

  constructor() {
    this._parent = new Set()
    this._children = new Set()
  }

  setParent(value: Set<string>): void {
    this._parent = value
  }

  getParent(): Set<string> {
    return this._parent
  }

  addParent(geoObjectUUID: string): void {
    this._parent.add(geoObjectUUID)
  }

  deleteParent(geoObjectUUID: string): boolean {
    return this._parent.delete(geoObjectUUID)
  }

  clearParent(): void {
    this._parent.clear()
  }

  isParentOf(geoObjectUUID: string): boolean {
    return this._children.has(geoObjectUUID)
  }

  setChildren(value: Set<string>): void {
    this._children = value
  }

  getChildren(): Set<string> {
    return this._children
  }

  addChildren(geoObjectUUID: string): void {
    this._children.add(geoObjectUUID)
  }

  deleteChildren(geoObjectUUID: string): boolean {
    return this._children.delete(geoObjectUUID)
  }

  clearChildren(): void {
    this._children.clear()
  }

  isChildrenOf(geoObjectUUID: string): boolean {
    return this._parent.has(geoObjectUUID)
  }
}
