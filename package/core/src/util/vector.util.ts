import { Position2 } from '@/object'
import { Compare, MathUtil } from './math.util'

export class Vector2 {
  // Add two vectors
  static add(v1: Position2, v2: Position2): Position2 {
    return [v1[0] + v2[0], v1[1] + v2[1]]
  }

  // v1 sub v2
  static sub(v1: Position2, v2: Position2): Position2 {
    return [v1[0] - v2[0], v1[1] - v2[1]]
  }

  // v1 dot v2
  static dot(v1: Position2, v2: Position2): number {
    return v1[0] * v2[0] + v1[1] * v2[1]
  }

  // v1 cross v2
  static cross(v1: Position2, v2: Position2): number {
    return v1[0] * v2[1] - v1[1] * v2[0]
  }

  // Computes the angle in radians with respect to the positive x-axis, The range of result in [0, 2pi]
  static angle(vector: Position2): number {
    return Math.atan2(-vector[1], -vector[0]) + Math.PI
  }

  // Computes the angle in radians from v1 to v2, The range of result in [0, pi]
  static angleTo(v1: Position2, v2: Position2): number {
    const denominator = Math.sqrt(
      Vector2.lengthSquare(v1) * Vector2.lengthSquare(v2),
    )
    if (Compare.EQ(denominator, 0)) return Math.PI / 2
    const theta = Vector2.dot(v1, v2) / denominator
    return Math.acos(MathUtil.clamp(theta, -1, 1))
  }

  // Computes the square of the length of the vector
  static lengthSquare(vector: Position2): number {
    return vector[0] * vector[0] + vector[1] * vector[1]
  }

  // Computes the distance from v1 to v2
  static distanceTo(v1: Position2, v2: Position2): number {
    const dx = v1[0] - v2[0]
    const dy = v1[1] - v2[1]
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Computes the square of the distance from v1 to v2
  static distanceToSquare(v1: Position2, v2: Position2): number {
    const dx = v1[0] - v2[0]
    const dy = v1[1] - v2[1]
    return dx * dx + dy * dy
  }
}
