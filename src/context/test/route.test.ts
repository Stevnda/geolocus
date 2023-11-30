import { Route } from '..'
import { GeolocusPointObject } from '../../object'

describe('Test the Route class', () => {
  test('return the graph of Route', () => {
    const route = new Route()

    expect(route.getChildrenGraph()).toEqual(new Map())
    expect(route.getParentGraph()).toEqual(new Map())
  })

  test('return the count of graph', () => {
    const route = new Route()
    expect(route.getVertexCount()).toBe(0)
    route.addEdge('1', '2')
    expect(route.getVertexCount()).toBe(2)
  })

  test('add the vertex', () => {
    const route = new Route()
    route.addVertex('2')

    const result = new Map([['2', new Set()]])
    expect(route.getChildrenGraph()).toEqual(result)
    expect(route.getChildrenGraph()).toEqual(result)
  })

  test('add the edge', () => {
    const route = new Route()
    route.addEdge('1', '2')
    route.addEdge('3', '2')

    const children = new Map([
      ['1', new Set(['2'])],
      ['3', new Set(['2'])],
      ['2', new Set()],
    ])
    const parent = new Map([
      ['1', new Set()],
      ['3', new Set()],
      ['2', new Set(['1', '3'])],
    ])
    expect(route.getChildrenGraph()).toEqual(children)
    expect(route.getParentGraph()).toEqual(parent)
  })

  test('remove the edge', () => {
    const route = new Route()
    route.addEdge('1', '2')
    route.addEdge('3', '2')
    route.removeEdge('3', '2')

    const children = new Map([
      ['1', new Set(['2'])],
      ['3', new Set()],
      ['2', new Set()],
    ])
    const parent = new Map([
      ['1', new Set()],
      ['3', new Set()],
      ['2', new Set(['1'])],
    ])
    expect(route.getChildrenGraph()).toEqual(children)
    expect(route.getParentGraph()).toEqual(parent)
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

  test('To Check whether fuzzyObject can computed', () => {
    const point0 = new GeolocusPointObject([0, 0])
    const point1 = new GeolocusPointObject([0, 0])
    const point2 = new GeolocusPointObject([0, 0], true)
    const point3 = new GeolocusPointObject([0, 0], true)
    const point4 = new GeolocusPointObject([0, 0], true)

    const route = new Route()
    expect(route.validateFuzzy('kxh')).toBeFalsy()
    expect(route.validateFuzzy(point0.getUUID())).toBeTruthy()
    expect(route.validateFuzzy(point2.getUUID())).toBeFalsy()
    route.addEdge(point3.getUUID(), point2.getUUID())
    route.addEdge(point4.getUUID(), point3.getUUID())
    expect(route.validateFuzzy(point2.getUUID())).toBeFalsy()
    route.addEdge(point0.getUUID(), point4.getUUID())
    route.addEdge(point1.getUUID(), point3.getUUID())
    expect(route.validateFuzzy(point2.getUUID())).toBeTruthy()
    route.addEdge(point2.getUUID(), point1.getUUID())
    expect(route.validateFuzzy(point2.getUUID())).toBeFalsy()
  })
})
