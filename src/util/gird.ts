import { GEO_MAX_VALUE } from '.'
import { GeolocusGird } from '../type'

export class Gird {
  static getGirdWithFillValue(row: number, col: number, fillValue: number) {
    const resultGird: GeolocusGird = []
    for (let y = 0; y < row; y++) {
      const temp = []
      for (let x = 0; x < col; x++) {
        temp.push(fillValue)
      }
      resultGird.push(temp)
    }

    return resultGird
  }

  static getGirdWithFilter(
    rowLength: number,
    colLength: number,
    filter: (row: number, col: number, gird: GeolocusGird) => number,
  ) {
    const resultGird: GeolocusGird = []
    for (let row = 0; row < rowLength; row++) {
      const temp = []
      for (let col = 0; col < colLength; col++) {
        temp.push(filter(row, col, resultGird))
      }
      resultGird.push(temp)
    }

    return resultGird
  }

  static forEach(
    gird: GeolocusGird,
    callbackFn: (
      value: number,
      row: number,
      col: number,
      gird: GeolocusGird,
    ) => void,
  ) {
    for (let row = 0; row < gird.length; row++) {
      for (let col = 0; col < gird[0].length; col++) {
        callbackFn(gird[row][col], row, col, gird)
      }
    }
  }

  static normalize(gird: GeolocusGird) {
    const transformGird = this.getGirdWithFillValue(
      gird.length,
      gird[0].length,
      0,
    )

    let max = -GEO_MAX_VALUE
    let min = GEO_MAX_VALUE
    for (let row = 0; row < gird.length; row++) {
      for (let col = 0; col < gird[0].length; col++) {
        if (gird[row][col] > max) max = gird[row][col]
        if (gird[row][col] < min) min = gird[row][col]
      }
    }
    if (max !== min) {
      for (let row = 0; row < gird.length; row++) {
        for (let col = 0; col < gird[0].length; col++) {
          transformGird[row][col] = (gird[row][col] - min) / (max - min)
        }
      }
    } else {
      for (let row = 0; row < gird.length; row++) {
        for (let col = 0; col < gird[0].length; col++) {
          transformGird[row][col] = gird[row][col]
        }
      }
    }

    return transformGird
  }
}
