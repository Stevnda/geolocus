import { GEO_MAX_VALUE, GeolocusGrid } from '.'

export class Grid {
  static createGridWithValue(row: number, col: number, fillValue: number) {
    const resultGrid: GeolocusGrid = []
    for (let y = 0; y < row; y++) {
      const temp: number[] = []
      for (let x = 0; x < col; x++) {
        temp.push(fillValue)
      }
      resultGrid.push(temp)
    }

    return resultGrid
  }

  static createGridWithFilter(
    rowLength: number,
    colLength: number,
    filter: (row: number, col: number, grid: GeolocusGrid) => number,
  ) {
    const resultGrid: GeolocusGrid = []
    for (let row = 0; row < rowLength; row++) {
      const temp: number[] = []
      for (let col = 0; col < colLength; col++) {
        temp.push(filter(row, col, resultGrid))
      }
      resultGrid.push(temp)
    }

    return resultGrid
  }

  static forEach(
    grid: GeolocusGrid,
    callbackFn: (value: number, row: number, col: number, grid: GeolocusGrid) => void,
  ) {
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        callbackFn(grid[row][col], row, col, grid)
      }
    }
  }

  static normalize(grid: GeolocusGrid) {
    const transformGrid = this.createGridWithValue(grid.length, grid[0].length, 0)

    let max = -GEO_MAX_VALUE
    let min = GEO_MAX_VALUE
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (grid[row][col] > max) max = grid[row][col]
        if (grid[row][col] < min) min = grid[row][col]
      }
    }
    if (max !== min) {
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
          transformGrid[row][col] = (grid[row][col] - min) / (max - min)
        }
      }
    } else {
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
          transformGrid[row][col] = 1
        }
      }
    }

    return transformGrid
  }
}
