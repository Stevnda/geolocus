import { GeolocusContext } from '.'
import { IRouteNode } from './type'

export class Route {
  // the uuid of node is the same as geolocusObject
  private _children: Map<string, Set<string>> // the child nodes of node
  private _parent: Map<string, Set<string>> // the parent nodes of node
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._children = new Map()
    this._parent = new Map()
    this._context = context
  }

  getChildrenGraph = () => {
    return this._children
  }

  getParentGraph = () => {
    return this._parent
  }

  getGraphNode = (uuid: string): IRouteNode => {
    const parent = this._parent.get(uuid)
    const children = this._children.get(uuid)
    return { parent, children }
  }

  getVertexCount = () => {
    return this._children.size || 0
  }

  addVertex = (uuid: string) => {
    const children = this._children.get(uuid)
    if (!children) {
      this._children.set(uuid, new Set())
      this._parent.set(uuid, new Set())
    }
  }

  addEdge = (parent: string, child: string) => {
    this.addVertex(parent)
    this.addVertex(child)
    const childrenSet = this._children.get(parent) as Set<string>
    const parentSet = this._parent.get(child) as Set<string>
    childrenSet.add(child)
    parentSet.add(parent)
  }

  removeEdge = (parent: string, child: string) => {
    const childrenSet = this._children.get(parent)
    const parentSet = this._parent.get(child)
    if (childrenSet) {
      childrenSet.delete(child)
    }
    if (parentSet) {
      parentSet.delete(parent)
    }
  }

  topologicalSort = () => {
    // generate inDegree of graph
    const inDegree: Record<string, number> = {}
    for (const key of this._children.keys()) {
      inDegree[key] = (this._parent.get(key) as Set<string>).size
    }

    // traversal the node that its inDegree is 0
    const queue: string[] = []
    for (const node in inDegree) {
      if (inDegree[node] === 0) {
        queue.push(node)
      }
    }

    // topological sort
    const result: string[] = []
    while (queue.length > 0) {
      const node = queue.shift() as string
      result.push(node)
      const children = this._children.get(node)
      if (children) {
        for (const child of children) {
          inDegree[child] -= 1
          if (inDegree[child] === 0) {
            queue.push(child)
          }
        }
      }
    }

    return result
  }

  validateFuzzy = (uuid: string) => {
    if (!(this._context.getObjectByObjectUUID(uuid)?.getStatus() === 'fuzzy')) {
      return false
    }
    const objectMap = this._context.getObjectMap()
    const fuzzyObject: Set<string> = new Set()
    objectMap.forEach((value, key) => {
      if (value.getStatus() === 'fuzzy') {
        fuzzyObject.add(key)
      }
    })

    const computedOrderStack: string[] = [uuid]
    const stack: string[] = [uuid]
    const visited: Set<string> = new Set()
    while (stack.length > 0) {
      const currentUUID = stack.pop() as string
      if (visited.has(currentUUID)) {
        return false
      }
      const parent = this._parent.get(currentUUID)
      if ((!parent || parent.size === 0) && fuzzyObject.has(currentUUID)) {
        return false
      }
      parent?.size && stack.push(...parent)
      visited.add(currentUUID)
      if (fuzzyObject.has(currentUUID)) {
        computedOrderStack.push(currentUUID)
      }
    }
    if (computedOrderStack[0] === computedOrderStack[1]) {
      computedOrderStack.shift()
    }
    return computedOrderStack
  }
}
