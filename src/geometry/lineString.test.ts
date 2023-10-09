import { BBoxGeometry } from './bbox'
import { LineStringGeometry } from './lineString'

describe('Test LineStringGeometry class', () => {
  test('Return the LineStringGeometry instance', () => {
    const lineString = new LineStringGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(lineString).toBeInstanceOf(LineStringGeometry)
  })

  test('Return the type of LineStringGeometry', () => {
    const lineString = new LineStringGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(lineString.getType()).toBe('LineString')
  })

  test('Return the vertex of LineStringGeometry', () => {
    const lineString = new LineStringGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(lineString.getVertex()).toEqual([
      [1, 1],
      [2, 2],
    ])
  })

  test('Return the bbox of LineStringGeometry', () => {
    const lineString = new LineStringGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(lineString.getBBox()).toEqual(new BBoxGeometry([1, 1], [2, 2]))
  })

  test('Return the clone of itself', () => {
    const lineString = new LineStringGeometry([
      [1, 1],
      [2, 2],
    ])
    expect(lineString.clone()).toEqual(lineString)
  })
})
