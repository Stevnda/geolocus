import { GeolocusContext } from './context'

export class Route {
  // the uuid of node is the same as geolocusObject
  private _outNodeList: Map<string, Set<string>>
  private _inNodeList: Map<string, Set<string>>
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._outNodeList = new Map()
    this._inNodeList = new Map()
    this._context = context
  }

  setInNodeList(value: Map<string, Set<string>>): void {
    this._inNodeList = value
  }

  getInNodeList(): Map<string, Set<string>> {
    return this._inNodeList
  }

  setOutNodeList(value: Map<string, Set<string>>): void {
    this._outNodeList = value
  }

  getOutNodeList(): Map<string, Set<string>> {
    return this._outNodeList
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }

  getContext(): GeolocusContext {
    return this._context
  }

  getNodeCount = () => {
    return this._outNodeList.size || 0
  }

  addEdge = (parent: string, child: string) => {
    this.addVertex(parent)
    this.addVertex(child)
    const childrenSet = this._outNodeList.get(parent) as Set<string>
    const parentSet = this._inNodeList.get(child) as Set<string>
    childrenSet.add(child)
    parentSet.add(parent)
  }

  removeEdge = (parent: string, child: string) => {
    const childrenSet = this._outNodeList.get(parent)
    const parentSet = this._inNodeList.get(child)
    if (childrenSet) {
      childrenSet.delete(child)
    }
    if (parentSet) {
      parentSet.delete(parent)
    }
  }

  private addVertex = (uuid: string) => {
    const children = this._outNodeList.get(uuid)
    if (!children) {
      this._outNodeList.set(uuid, new Set())
      this._inNodeList.set(uuid, new Set())
    }
  }
}
