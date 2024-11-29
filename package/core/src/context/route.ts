import { GeolocusContext } from './context'
import { ObjectMapAction } from './objectMap'

export class RouteNode {
  private _level: number
  private _outNodeList: Set<string>
  private _inNodeList: Set<string>

  constructor(level: number) {
    this._level = level
    this._outNodeList = new Set()
    this._inNodeList = new Set()
  }

  getLevel(): number {
    return this._level
  }

  setLevel(level: number): void {
    this._level = level
  }

  setOutNodeList(outNodeList: Set<string>) {
    this._outNodeList = outNodeList
  }

  getOutNodeList(): Set<string> {
    return this._outNodeList
  }

  setInNodeList(inNodeList: Set<string>) {
    this._inNodeList = inNodeList
  }

  getInNodeList(): Set<string> {
    return this._inNodeList
  }
}

export class Route {
  // the uuid of node is the same as geolocusObject
  private _nodeList: Map<string, RouteNode>
  private _context: GeolocusContext

  constructor(context: GeolocusContext) {
    this._nodeList = new Map()
    this._nodeList.set('root', new RouteNode(0))
    this._context = context
  }

  getRootNode(): RouteNode {
    return <RouteNode>this._nodeList.get('root')
  }

  setNodeList(value: Map<string, RouteNode>): void {
    this._nodeList = value
  }

  getNodeList(): Map<string, RouteNode> {
    return this._nodeList
  }

  getNodeByUUID(uuid: string): RouteNode | null {
    return this._nodeList.get(uuid) || null
  }

  setContext(value: GeolocusContext): void {
    this._context = value
  }

  getContext(): GeolocusContext {
    return this._context
  }

  getNodeCount(): number {
    return this._nodeList.size || 0
  }

  addEdge(parent: string, child: string): void {
    this.addVertex(parent, true)
    this.addVertex(child)
    const childrenNode = <RouteNode>this.getNodeByUUID(child)
    const parentNode = <RouteNode>this.getNodeByUUID(parent)
    childrenNode.setLevel(Math.max(parentNode.getLevel() + 1, childrenNode.getLevel()))
    childrenNode.getInNodeList().add(parent)
    parentNode.getOutNodeList().add(child)
  }

  removeEdge(parent: string, child: string): void {
    const childrenNode = <RouteNode>this.getNodeByUUID(child)
    const parentNode = <RouteNode>this.getNodeByUUID(parent)
    childrenNode.getInNodeList().delete(parent)
    parentNode.getOutNodeList().delete(child)
  }

  private addVertex(uuid: string, connextRoot = false): void {
    if (this.getNodeList().has(uuid)) return

    const node = new RouteNode(1)
    this.getNodeList().set(uuid, node)
    if (connextRoot) this.addEdge('root', uuid)
  }
}

export class RouteAction {
  static validateRouteValidity(route: Route) {
    const nodeList = route.getNodeList()
    // generate inDegree of graph
    const inDegree: Record<string, number> = {}
    for (const [key, node] of nodeList.entries()) {
      inDegree[key] = node.getInNodeList().size
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
      const children = nodeList.get(node)?.getOutNodeList()
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

  static computeObjectOrder(context: GeolocusContext, uuid: string, route: Route) {
    // generate inNode map
    const inNode: Map<string, Set<string>> = new Map()
    for (const [key, node] of route.getNodeList().entries()) {
      inNode.set(key, node.getInNodeList())
    }

    // the object must be fuzzy object
    const objectMap = context.getObjectMap()
    const object = ObjectMapAction.getObjectByUUID(objectMap, uuid)
    if (!object || object.getStatus() !== 'fuzzy') {
      return false
    }

    // get all fuzzy object
    const objectUUIDMap = objectMap.getUUIDMap()
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
      if (visited.has(currentUUID) && fuzzyObject.has(currentUUID)) {
        return false
      }
      // all object are computed
      const parent = inNode.get(currentUUID)
      if ((!parent || parent.size === 0) && fuzzyObject.has(currentUUID)) {
        return false
      }
      parent?.size && stack.push(...[...parent].filter((value) => value !== 'root'))
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
