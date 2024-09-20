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
}

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
