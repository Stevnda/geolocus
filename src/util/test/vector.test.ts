import { Position2 } from '../../type'
import { Compare } from '../mathUtil'
import { Vector2 } from '../vector'

describe('Test Vector2 Class', () => {
  test('Add two Vector2 instance', () => {
    const v1: Position2 = [2, 1]
    const v2: Position2 = [3, 3]
    expect(Vector2.add(v1, v2)).toEqual([5, 4])
  })

  test('Sub two Vector2 instance', () => {
    const v1: Position2 = [2, 1]
    const v2: Position2 = [3, 3]
    expect(Vector2.sub(v1, v2)).toEqual([-1, -2])
  })

  test('Dot two Vector2 instance', () => {
    const v1: Position2 = [2, 1]
    const v2: Position2 = [3, 3]
    expect(Vector2.dot(v1, v2)).toBe(9)
  })

  test('Cross two Vector2 instance', () => {
    const v1: Position2 = [2, 1]
    const v2: Position2 = [3, 3]
    expect(Vector2.cross(v1, v2)).toBe(3)
  })

  test('Return the angle in radians from positive x-axis to Vector2 instance', () => {
    const v1: Position2 = [1, 1]
    expect(Vector2.angle(v1)).toBe(Math.PI / 4)
    const v2: Position2 = [1, -1]
    expect(Vector2.angle(v2)).toBe((Math.PI / 4) * 7)
  })

  test('Return the angle in radians from itself to other Vector2 instance', () => {
    const v1: Position2 = [1, 0]
    const v2: Position2 = [1, 1]
    const v3: Position2 = [0, 0]
    const result = Vector2.angleTo(v1, v2)
    expect(() => Compare.EQ(result, Math.PI / 4)).toBeTruthy()
    expect(Vector2.angleTo(v1, v3)).toBe(Math.PI / 2)
  })

  test('Return the square of the length of Vector2 instances', () => {
    const v1: Position2 = [2, 0]
    expect(Vector2.lengthSquare(v1)).toBe(4)
  })

  test('Return the distance between two Vector2 instances', () => {
    const v1: Position2 = [1, 0]
    const v2: Position2 = [1, 1]
    expect(Vector2.distanceTo(v1, v2)).toBe(1)
  })

  test('Return the square of the distance between two Vector2 instances', () => {
    const v1: Position2 = [1, 0]
    const v2: Position2 = [1, 2]
    expect(Vector2.distanceToSquare(v1, v2)).toBe(4)
  })
})
