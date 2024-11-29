import { GeolocusContext } from './context'
import { ObjectMapAction } from './objectMap'

export type RouteRelationType = 'calculation' | 'subordination' | 'association'

export class RouteNode {
  private _level: number
  private _outNodeMap: Map<string, Set<RouteRelationType>>
  private _inNodeMap: Map<string, Set<RouteRelationType>>

  constructor(level: number) {
    this._level = level
    this._outNodeMap = new Map()
    this._inNodeMap = new Map()
  }

  getLevel(): number {
    return this._level
  }

  setLevel(level: number): void {
    this._level = level
  }

  setOutNodeMap(outNodeMap: Map<string, Set<RouteRelationType>>) {
    this._outNodeMap = outNodeMap
  }

  getOutNodeMap(): Map<string, Set<RouteRelationType>> {
    return this._outNodeMap
  }

  setInNodeMap(inNodeMap: Map<string, Set<RouteRelationType>>) {
    this._inNodeMap = inNodeMap
  }

  getInNodeMap(): Map<string, Set<RouteRelationType>> {
    return this._inNodeMap
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

  addEdge(
    parent: string,
    child: string,
    routeEdgeType: RouteRelationType,
  ): void {
    this.addVertex(parent, routeEdgeType, true)
    this.addVertex(child, routeEdgeType)
    const childrenNode = <RouteNode>this.getNodeByUUID(child)
    const parentNode = <RouteNode>this.getNodeByUUID(parent)
    childrenNode.setLevel(
      Math.max(parentNode.getLevel() + 1, childrenNode.getLevel()),
    )

    const inNodeListOfChild = childrenNode.getInNodeMap()
    if (inNodeListOfChild.has(parent)) {
      inNodeListOfChild.get(parent)?.add(routeEdgeType)
    } else {
      inNodeListOfChild.set(parent, new Set([routeEdgeType]))
    }
    const outNodeListOfParent = parentNode.getOutNodeMap()
    if (outNodeListOfParent.has(child)) {
      outNodeListOfParent.get(child)?.add(routeEdgeType)
    } else {
      outNodeListOfParent.set(child, new Set([routeEdgeType]))
    }
  }

  removeEdge(parent: string, child: string): void {
    const childrenNode = <RouteNode>this.getNodeByUUID(child)
    const parentNode = <RouteNode>this.getNodeByUUID(parent)
    for (const nodeID of childrenNode.getInNodeMap().keys()) {
      if (nodeID !== parent) continue
      childrenNode.getInNodeMap().delete(nodeID)
      break
    }
    for (const nodeID of parentNode.getOutNodeMap().keys()) {
      if (nodeID !== child) continue
      parentNode.getOutNodeMap().delete(nodeID)
      break
    }
    if (
      childrenNode.getInNodeMap().size === 0 &&
      childrenNode.getOutNodeMap().size === 0
    ) {
      this.getNodeList().delete(child)
    }
    if (
      parentNode.getInNodeMap().size === 0 &&
      parentNode.getOutNodeMap().size === 0
    ) {
      this.getNodeList().delete(parent)
    }
  }

  private addVertex(
    uuid: string,
    routeEdgeType: RouteRelationType,
    connextRoot = false,
  ): void {
    if (this.getNodeList().has(uuid)) return

    const node = new RouteNode(1)
    this.getNodeList().set(uuid, node)
    if (connextRoot) this.addEdge('root', uuid, routeEdgeType)
  }
}

export class RouteAction {
  static validateRouteValidity(route: Route) {
    const nodeList = route.getNodeList()
    // generate inDegree of graph
    const inDegree: Record<string, number> = {}
    for (const [key, node] of nodeList.entries()) {
      inDegree[key] = Array.from(node.getInNodeMap().values()).filter(
        (typeSet) => typeSet.has('calculation'),
      ).length
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
      const children = nodeList.get(node)?.getOutNodeMap()
      if (!children) continue
      for (const [nodeID, typeSet] of children) {
        if (!typeSet.has('calculation')) continue
        inDegree[nodeID] -= 1
        if (inDegree[nodeID] === 0) {
          queue.push(nodeID)
        }
      }
    }

    return result.length === route.getNodeCount()
      ? [true, result]
      : [false, null]
  }

  static computeObjectOrder(
    context: GeolocusContext,
    uuid: string,
    route: Route,
  ) {
    // generate inNode map
    const inNode: Map<string, Set<string>> = new Map()
    for (const [key, node] of route.getNodeList().entries()) {
      inNode.set(
        key,
        new Set(
          Array.from(node.getInNodeMap().entries())
            .filter(([, typeSet]) => typeSet.has('calculation'))
            .map(([nodeID]) => nodeID),
        ),
      )
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
      parent?.size &&
        stack.push(...[...parent].filter((value) => value !== 'root'))
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
