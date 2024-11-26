/* eslint-disable @typescript-eslint/ban-types */
import { GeolocusGrid } from '@/util'

function pathTo(node: GridNode) {
  let curr = node
  const path = []
  while (curr.parent) {
    path.unshift(curr)
    curr = curr.parent
  }
  return path
}

function getHeap() {
  return new BinaryHeap(function (node: GridNode) {
    return node.f
  })
}

export class AStar {
  static heuristics = {
    manhattan: function (pos0: GridNode, pos1: GridNode) {
      const d1 = Math.abs(pos1.x - pos0.x)
      const d2 = Math.abs(pos1.y - pos0.y)
      return d1 + d2
    },
    diagonal: function (pos0: GridNode, pos1: GridNode) {
      const D = 1
      const D2 = Math.sqrt(2)
      const d1 = Math.abs(pos1.x - pos0.x)
      const d2 = Math.abs(pos1.y - pos0.y)
      return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2)
    },
  }

  static search(
    graph: Graph,
    start: GridNode,
    end: GridNode,
    options: {
      closest: boolean
      heuristic: Function | null
    } = {
      closest: false,
      heuristic: null,
    },
  ) {
    graph.cleanDirty()
    options = options || {}
    const heuristic = options.heuristic || AStar.heuristics.manhattan
    const closest = options.closest || false

    const openHeap = getHeap()
    let closestNode = start

    start.h = heuristic(start, end)
    graph.markDirty(start)

    openHeap.push(start)

    while (openHeap.size() > 0) {
      const currentNode = openHeap.pop()

      if (currentNode === end) {
        return pathTo(currentNode)
      }

      currentNode.closed = true

      const neighbors = graph.neighbors(currentNode)

      for (let i = 0, il = neighbors.length; i < il; ++i) {
        const neighbor = neighbors[i]

        if (neighbor.closed || neighbor.isWall()) {
          continue
        }

        const gScore = currentNode.g + neighbor.getCost(currentNode)
        const beenVisited = neighbor.visited

        if (!beenVisited || gScore < neighbor.g) {
          neighbor.visited = true
          neighbor.parent = currentNode
          neighbor.h = neighbor.h || heuristic(neighbor, end)
          neighbor.g = gScore
          neighbor.f = neighbor.g + neighbor.h
          graph.markDirty(neighbor)
          if (closest) {
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
              closestNode = neighbor
            }
          }

          if (!beenVisited) {
            openHeap.push(neighbor)
          } else {
            openHeap.rescoreElement(neighbor)
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode)
    }

    return []
  }

  static cleanNode(node: GridNode) {
    node.f = 0
    node.g = 0
    node.h = 0
    node.visited = false
    node.closed = false
    node.parent = null
  }
}

export class Graph {
  nodes: GridNode[]
  grid: GridNode[][]
  diagonal: boolean
  dirtyNodes: GridNode[]

  constructor(gridIn: GeolocusGrid, options = { diagonal: false }) {
    options = options || {}
    this.nodes = []
    this.diagonal = !!options.diagonal
    this.grid = []
    for (let x = 0; x < gridIn.length; x++) {
      this.grid[x] = []

      for (let y = 0, row = gridIn[x]; y < row.length; y++) {
        const node = new GridNode(x, y, row[y])
        this.grid[x][y] = node
        this.nodes.push(node)
      }
    }
    this.dirtyNodes = []
    for (let i = 0; i < this.nodes.length; i++) {
      AStar.cleanNode(this.nodes[i])
    }
  }

  cleanDirty() {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      AStar.cleanNode(this.dirtyNodes[i])
    }
    this.dirtyNodes = []
  }

  markDirty(node: GridNode) {
    this.dirtyNodes.push(node)
  }

  neighbors(node: GridNode) {
    const ret = []
    const x = node.x
    const y = node.y
    const grid = this.grid

    // West
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y])
    }
    // East
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y])
    }
    // South
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1])
    }
    // North
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1])
    }
    if (this.diagonal) {
      // Southwest
      if (grid[x - 1] && grid[x - 1][y - 1]) {
        ret.push(grid[x - 1][y - 1])
      }
      // Southeast
      if (grid[x + 1] && grid[x + 1][y - 1]) {
        ret.push(grid[x + 1][y - 1])
      }
      // Northwest
      if (grid[x - 1] && grid[x - 1][y + 1]) {
        ret.push(grid[x - 1][y + 1])
      }
      // Northeast
      if (grid[x + 1] && grid[x + 1][y + 1]) {
        ret.push(grid[x + 1][y + 1])
      }
    }

    return ret
  }

  toString() {
    const graphString = []
    const nodes = this.grid
    for (let x = 0; x < nodes.length; x++) {
      const rowDebug = []
      const row = nodes[x]
      for (let y = 0; y < row.length; y++) {
        rowDebug.push(row[y].weight)
      }
      graphString.push(rowDebug.join(' '))
    }
    return graphString.join('\n')
  }
}

class GridNode {
  x: number
  y: number
  weight: number
  f: number
  g: number
  h: number
  visited: boolean
  closed: boolean
  parent: GridNode | null

  constructor(x: number, y: number, weight: number) {
    this.x = x
    this.y = y
    this.weight = weight
    this.f = 0
    this.g = 0
    this.h = 0
    this.visited = false
    this.closed = false
    this.parent = null
  }

  toString() {
    return '[' + this.x + ' ' + this.y + ']'
  }

  getCost(fromNeighbor: GridNode) {
    if (fromNeighbor && fromNeighbor.x !== this.x && fromNeighbor.y !== this.y) {
      return this.weight * 1.41421
    }
    return this.weight
  }

  isWall() {
    return this.weight === 0
  }
}

class BinaryHeap {
  content: GridNode[]
  scoreFunction: Function

  constructor(scoreFunction: Function) {
    this.content = []
    this.scoreFunction = scoreFunction
  }

  push(element: GridNode) {
    this.content.push(element)
    this.sinkDown(this.content.length - 1)
  }

  pop() {
    const result = this.content[0]
    const end = this.content.pop() as GridNode
    if (this.content.length > 0) {
      this.content[0] = end
      this.bubbleUp(0)
    }
    return result
  }

  remove(node: GridNode) {
    const i = this.content.indexOf(node)
    const end = this.content.pop() as GridNode

    if (i !== this.content.length - 1) {
      this.content[i] = end
      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i)
      } else {
        this.bubbleUp(i)
      }
    }
  }

  size() {
    return this.content.length
  }

  rescoreElement(node: GridNode) {
    this.sinkDown(this.content.indexOf(node))
  }

  sinkDown(n: number) {
    const element = this.content[n]

    while (n > 0) {
      const parentN = ((n + 1) >> 1) - 1
      const parent = this.content[parentN]
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element
        this.content[n] = parent
        n = parentN
      } else {
        break
      }
    }
  }
  bubbleUp(n: number) {
    const length = this.content.length
    const element = this.content[n]
    const elemScore = this.scoreFunction(element)

    while (true) {
      const child2N = (n + 1) << 1
      const child1N = child2N - 1
      let swap = null
      let child1Score
      if (child1N < length) {
        const child1 = this.content[child1N]
        child1Score = this.scoreFunction(child1)

        if (child1Score < elemScore) {
          swap = child1N
        }
      }

      if (child2N < length) {
        const child2 = this.content[child2N]
        const child2Score = this.scoreFunction(child2)
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N
        }
      }

      if (swap !== null) {
        this.content[n] = this.content[swap]
        this.content[swap] = element
        n = swap
      } else {
        break
      }
    }
  }
}
