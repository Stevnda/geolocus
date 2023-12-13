import { Gird } from '../gird'

describe('Test Gird class', () => {
  test('Create gird with value', () => {
    const gird = Gird.createGirdWithFillValue(1, 1, 1)
    expect(gird).toEqual([[1]])
  })

  test('Create gird with function', () => {
    const gird = Gird.createGirdWithFilter(2, 2, (row, col) => row + col)
    expect(gird).toEqual([
      [0, 1],
      [1, 2],
    ])
  })

  test('Iterate the gird', () => {
    const gird = Gird.createGirdWithFilter(2, 2, (row, col) => row + col)
    Gird.forEach(gird, (value, row, col, gird) => {
      gird[row][col] = value - 1
    })
    expect(gird).toEqual([
      [-1, 0],
      [0, 1],
    ])
  })

  test('Normalize the gird', () => {
    const gird0 = Gird.createGirdWithFilter(2, 2, (row, col) => row + col)
    const gird1 = Gird.createGirdWithFillValue(2, 2, 2)
    expect(Gird.normalize(gird0)).toEqual([
      [0, 0.5],
      [0.5, 1],
    ])
    expect(Gird.normalize(gird1)).toEqual([
      [1, 1],
      [1, 1],
    ])
  })
})
