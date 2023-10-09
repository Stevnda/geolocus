import { BBoxGeometry } from './bbox'
import { PointGeometry } from './point'

describe('Test PointGeometry class', () => {
  test('Return the PointGeometry instance', () => {
    const point = new PointGeometry([1, 1])
    expect(point).toBeInstanceOf(PointGeometry)
  })

  test('Return the type of PointGeometry', () => {
    const point = new PointGeometry([1, 1])
    expect(point.getType()).toBe('Point')
  })

  test('Return the vertex of PointGeometry', () => {
    const point = new PointGeometry([1, 1])
    expect(point.getVertex()).toEqual([1, 1])
  })

  test('Return the bbox of PointGeometry', () => {
    const point = new PointGeometry([1, 1])
    expect(point.getBBox()).toEqual(new BBoxGeometry([1, 1], [1, 1]))
  })

  test('Return the clone of itself', () => {
    const point = new PointGeometry([1, 1])
    expect(point.clone()).toEqual(point)
  })
})
