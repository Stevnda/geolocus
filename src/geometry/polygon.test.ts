import { BBoxGeometry } from './bbox'
import { PolygonGeometry } from './polygon'

describe('Test PolygonGeometry class', () => {
  test('Return the PolygonGeometry instance', () => {
    const polygon = new PolygonGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(polygon).toBeInstanceOf(PolygonGeometry)
  })

  test('Return the type of PolygonGeometry', () => {
    const polygon = new PolygonGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(polygon.getType()).toBe('Polygon')
  })

  test('Return the vertex of PolygonGeometry', () => {
    const polygon = new PolygonGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(polygon.getVertex()).toEqual([
      [1, 1],
      [2, 2],
    ])
  })

  test('Return the bbox of PolygonGeometry', () => {
    const polygon = new PolygonGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(polygon.getBBox()).toEqual(new BBoxGeometry([1, 1], [2, 2]))
  })

  test('Return the clone of itself', () => {
    const polygon = new PolygonGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(polygon.clone()).toEqual(polygon)
  })
})
