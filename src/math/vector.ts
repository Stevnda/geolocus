import { Position2 } from '../type'
import { Compare, MathUtil } from './mathUtil'

export class Vector2 {
  /**
   * Add two vectors and return result
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {Position2} result
   */
  static add(v1: Position2, v2: Position2): Position2 {
    return [v1[0] + v2[0], v1[1] + v2[1]]
  }

  /**
   * v1 sub v2 and return result
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {Position2} result
   */
  static sub(v1: Position2, v2: Position2): Position2 {
    return [v1[0] - v2[0], v1[1] - v2[1]]
  }

  /**
   * v1 dot v2 and return result
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {number} result
   */
  static dot(v1: Position2, v2: Position2): number {
    return v1[0] * v2[0] + v1[1] * v2[1]
  }

  /**
   * v1 cross v2 and return result
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {number} result
   */
  static cross(v1: Position2, v2: Position2): number {
    return v1[0] * v2[1] - v1[1] * v2[0]
  }

  /**
   * Return the angle in radians with respect to the positive x-axis.
   * The range of result in [0, 2pi]
   * @param {Position2} vector vector
   * @returns {number} the angle in radians
   */
  static angle(vector: Position2): number {
    const angle = Math.atan2(-vector[1], -vector[0]) + Math.PI
    return angle
  }

  /**
   * Computes the angle in radians from v1 to v2.
   * The range of result in [0, pi]
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {number} the angle in radians
   */
  static angleTo(v1: Position2, v2: Position2): number {
    const denominator = Math.sqrt(
      Vector2.lengthSquare(v1) * Vector2.lengthSquare(v2),
    )
    if (Compare.EQ(denominator, 0)) return Math.PI / 2
    const theta = Vector2.dot(v1, v2) / denominator
    return Math.acos(MathUtil.clamp(theta, -1, 1))
  }

  /**
   * Return the square of the length of the vector
   * @param {Position2} vector vector
   * @returns {number} the length
   */
  static lengthSquare(vector: Position2): number {
    return vector[0] * vector[0] + vector[1] * vector[1]
  }

  /**
   * Return the distance from v1 to v2
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {number} the distance
   */
  static distanceTo(v1: Position2, v2: Position2): number {
    const dx = v1[0] - v2[0]
    const dy = v1[1] - v2[1]
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Return the square of the distance to other vector
   * @param {Position2} v1 vector
   * @param {Position2} v2 vector
   * @returns {number} the distance
   */
  static distanceToSquare(v1: Position2, v2: Position2): number {
    const dx = v1[0] - v2[0]
    const dy = v1[1] - v2[1]
    return dx * dx + dy * dy
  }
}
