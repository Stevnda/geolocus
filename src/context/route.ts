export class Route {
  private _graph: Map<string, Set<string>>

  constructor() {
    this._graph = new Map()
  }

  getGraph() {
    return this._graph
  }

  getVertexCount() {
    return this._graph.size
  }

  addVertex(parent: string) {
    const children = this._graph.get(parent)
    if (!children) {
      const children = new Set([])
      this._graph.set(parent, children)
    }
  }

  addEdge(parent: string, child: string) {
    const children = this._graph.get(parent)
    if (!children) {
      const children = new Set([child])
      this._graph.set(parent, children)
    } else {
      children.add(child)
    }
    this.addVertex(child)
  }

  topologicalSort() {
    // generate inDegree of graph
    const inDegree: Record<string, number> = {}
    for (const key of this._graph.keys()) {
      inDegree[key] = 0
    }
    for (const key of this._graph.keys()) {
      const children = this._graph.get(key)
      if (children) {
        for (const child of children) {
          inDegree[child] += 1
        }
      }
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
      const children = this._graph.get(node)
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
}
