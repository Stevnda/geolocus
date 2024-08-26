export class Compare {
  private static _EPSILON = Number.EPSILON
  static EQ(x: number, y: number) {
    return x - y <= this._EPSILON && x - y >= -this._EPSILON
  }

  static GT(x: number, y: number) {
    return x - y >= this._EPSILON
  }

  static GE(x: number, y: number) {
    return x - y >= -this._EPSILON
  }

  static LT(x: number, y: number) {
    return x - y <= -this._EPSILON
  }

  static LE(x: number, y: number) {
    return x - y <= this._EPSILON
  }

  static RANGE(x: number, min: number, max: number) {
    return this.GE(x, min) && this.LE(x, max)
  }
}

export const MathUtil = {
  clamp: (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value))
  },

  // rangeOverlap: (
  //   r0: [number, number],
  //   r1: [number, number],
  // ): null | [number, number] => {
  //   if (r0[0] > r0[1] || r1[0] > r1[1]) {
  //     return null
  //   }
  //   if (r0[0] > r1[1] || r1[0] > r0[1]) {
  //     return null
  //   }

  //   const start = Math.max(r0[0], r1[0])
  //   const end = Math.min(r0[1], r1[1])

  //   return [start, end]
  // },
}
