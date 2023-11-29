import { Compare, MathUtil } from './mathUtil'

/**
 * Test the Compare class
 */
describe('Test the Compare class', () => {
  test('Return true if two elements are equal', () => {
    const x = 1
    const y = x + 0.000001 * 0.9
    const z = x + 0.000001 * 1.1
    expect(Compare.EQ(x, y)).toBeTruthy()
    expect(Compare.EQ(x, z)).toBeFalsy()
  })

  test('Return true if the first is great than the second', () => {
    const x = 1
    const y = x - 0.000001 * 1.1
    const z = x - 0.000001 * 0.9
    expect(Compare.GT(x, y)).toBeTruthy()
    expect(Compare.GT(x, z)).toBeFalsy()
  })

  test('Return true if the first is great than or equal to the second', () => {
    const x = 1
    const y = x + 0.000001 * 0.9
    const z = x + 0.000001 * 1.1
    expect(Compare.GE(x, y)).toBeTruthy()
    expect(Compare.GE(x, z)).toBeFalsy()
  })

  test('Return true if the first is less than the second', () => {
    const x = 1
    const y = x + 0.000001 * 1.1
    const z = x + 0.000001 * 0.9
    expect(Compare.LT(x, y)).toBeTruthy()
    expect(Compare.LT(x, z)).toBeFalsy()
  })

  test('Return true if the first is less than or equal to the second', () => {
    const x = 1
    const y = x - 0.000001 * 0.9
    const z = x - 0.000001 * 1.1
    expect(Compare.LE(x, y)).toBeTruthy()
    expect(Compare.LE(x, z)).toBeFalsy()
  })

  test('Return true if the number in selected range', () => {
    const x = 1
    const y = x - 0.000001 * 0.9
    const z = x - 0.000001 * 1.1
    expect(Compare.RANGE(x, 0, y)).toBeTruthy()
    expect(Compare.RANGE(x, 0, z)).toBeFalsy()
  })
})

describe('Test some math utils', () => {
  test('Clamp the value', () => {
    expect(MathUtil.clamp(1, -1, 0)).toBe(0)
    expect(MathUtil.clamp(1, -1, 2)).toBe(1)
    expect(MathUtil.clamp(1, 2, 3)).toBe(2)
  })
})
