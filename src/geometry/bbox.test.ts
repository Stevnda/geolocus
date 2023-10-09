import { BBoxGeometry } from './bbox'

describe('Test BBoxGeometry class', () => {
  test('Return the BBoxGeometry instance', () => {
    const bbox = new BBoxGeometry([1, 1], [2, 2])
    expect(bbox).toBeInstanceOf(BBoxGeometry)
  })

  test('Return the type of BBoxGeometry', () => {
    const bbox = new BBoxGeometry([1, 1], [2, 2])
    expect(bbox.getType()).toBe('BBox')
  })

  test('Return the vertex of BBoxGeometry', () => {
    const bbox = new BBoxGeometry([1, 1], [2, 2])
    expect(bbox.getVertex()).toEqual([
      [1, 1],
      [2, 2],
    ])
  })

  test('Return the bbox of BBoxGeometry', () => {
    const bbox = new BBoxGeometry([1, 1], [2, 2])
    expect(bbox.getBBox()).toBe(bbox)
  })

  test('Return the clone of itself', () => {
    const bbox = new BBoxGeometry([1, 1], [2, 2])
    expect(bbox.clone()).toEqual(bbox)
  })

  test('Return the bbox by points', () => {
    const bbox = BBoxGeometry.getBBoxFromPoints([
      [1, 1],
      [-1, -1],
      [3, 3],
    ])
    expect(bbox).toEqual(new BBoxGeometry([-1, -1], [3, 3]))
  })
})
