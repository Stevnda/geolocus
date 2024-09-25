import { GeolocusContext } from '.'
import { Route } from './route.actor'

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

    return result.length === route.getNodeCount()
      ? [true, result]
      : [false, null]
  }

  static computeObjectOrder(
    context: GeolocusContext,
    uuid: string,
    inNode: Map<string, Set<string>>,
  ) {
    // the object must be fuzzy object
    const objectMap = context.getObjectMap()
    const object = objectMap.getObjectByUUID(uuid)
    if (!object || object.getStatus() !== 'fuzzy') {
      return false
    }

    // get all fuzzy object
    const objectUUIDMap = objectMap.getObjectUUIDMap()
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
