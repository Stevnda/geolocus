import { Route } from '.'

describe('Test the Route class', () => {
  test('return the graph of Route', () => {
    const route = new Route()
    route.addEdge('1', '2')

    const result = new Map([
      ['1', new Set(['2'])],
      ['2', new Set()],
    ])
    expect(route.getGraph()).toEqual(result)
  })

  test('return the count of graph', () => {
    const route = new Route()
    route.addEdge('1', '2')

    expect(route.getVertexCount()).toBe(2)
  })

  test('add the vertex', () => {
    const route = new Route()
    route.addVertex('2')

    const result = new Map([['2', new Set()]])
    expect(route.getGraph()).toEqual(result)
  })

  test('add the edge', () => {
    const route = new Route()
    route.addEdge('1', '2')
    route.addEdge('3', '2')

    const result = new Map([
      ['1', new Set(['2'])],
      ['3', new Set(['2'])],
      ['2', new Set()],
    ])
    expect(route.getGraph()).toEqual(result)
  })

  test('topological sort', () => {
    const route = new Route()
    route.addEdge('5', '2')
    route.addEdge('5', '0')
    route.addEdge('4', '0')
    route.addEdge('4', '1')
    route.addEdge('2', '3')
    route.addEdge('3', '1')

    expect(route.topologicalSort()).toEqual(['4', '5', '2', '0', '3', '1'])
  })
})
