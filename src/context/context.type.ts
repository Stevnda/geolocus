export interface IRoute {
  getParent(): Set<string>
  setParent(parent: Set<string>): void
  addParent(geoObjectUUID: string): void
  deleteParent(geoObjectUUID: string): boolean
  clearParent(): void
  isParentOf(geoObjectUUID: string): boolean
  getChildren(): Set<string>
  setChildren(children: Set<string>): void
  addChildren(geoObjectUUID: string): void
  deleteChildren(geoObjectUUID: string): boolean
  clearChildren(): void
  isChildrenOf(geoObjectUUID: string): boolean
}
