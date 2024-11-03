import { GeolocusContext } from './context'
import { ObjectMapAction } from './objectMap'

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

export class RouteAction {
  static validateRouteValidity(route: Route) {
    const outNodeList = route.getOutNodeList()
    const inNodeList = route.getInNodeList()
    // generate inDegree of graph
    const inDegree: Record<string, number> = {}
    for (const key of outNodeList.keys()) {
      inDegree[key] = (inNodeList.get(key) as Set<string>).size
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
      const children = outNodeList.get(node)
      if (children) {
        for (const child of children) {
          inDegree[child] -= 1
          if (inDegree[child] === 0) {
            queue.push(child)
          }
        }
      }
    }

    return result.length === route.getNodeCount() ? [true, result] : [false, null]
  }

  static computeObjectOrder(context: GeolocusContext, uuid: string, inNode: Map<string, Set<string>>) {
    // the object must be fuzzy object
    const objectMap = context.getObjectMap()
    const object = ObjectMapAction.getObjectByUUID(objectMap, uuid)
    if (!object || object.getStatus() !== 'fuzzy') {
      return false
    }

    // get all fuzzy object
    const objectUUIDMap = objectMap.getUuidMap()
    const fuzzyObject: Set<string> = new Set()
    objectUUIDMap.forEach((value, key) => {
      if (value.getStatus() === 'fuzzy') {
        fuzzyObject.add(key)
      }
    })

    // calculate order based on DFS
    const computedOrderStack: string[] = [uuid]
    const stack: string[] = [uuid]
    const visited: Set<string> = new Set()
    while (stack.length > 0) {
      const currentUUID = stack.pop() as string
      // has circle
      if (visited.has(currentUUID)) {
        return false
      }
      // all object are computed
      const parent = inNode.get(currentUUID)
      if ((!parent || parent.size === 0) && fuzzyObject.has(currentUUID)) {
        return false
      }
      parent?.size && stack.push(...parent)
      visited.add(currentUUID)
      if (fuzzyObject.has(currentUUID)) {
        computedOrderStack.push(currentUUID)
      }
    }
    // No need to calculate other fuzzy object
    if (computedOrderStack[0] === computedOrderStack[1]) {
      computedOrderStack.shift()
    }
    return computedOrderStack
  }
}
