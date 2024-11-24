export interface ArrangementLayout {
  type: 'uniform' | 'random' | 'between'
  number: number
}

export interface LinearLayout {
  type: 'straight'
  number: number
  init: {
    length: number
  }
}

export interface CircularLayout {
  type: 'solid' | 'hollow' | 'annulus'
  number: number
  init: {
    radius0: number
    radius1: number
  }
}

export interface TriangularLayout {
  type: 'solid' | 'hollow' | 'vFormation'
  number: number
  init: {
    angle: number
    sideLength: number
  }
}

export interface RectangularLayout {
  type: 'solid' | 'hollow'
  number: number
  init: {
    width: number
    height: number
  }
}

export interface HexagonalLayout {
  type: 'solid' | 'hollow'
  number: number
  init: {
    sideLength: number
  }
}

// export interface RegularPolygonLayout {
//   type: number
//   number: number
//   init: {
//     sideLength: number
//   }
// }

export interface CustomLayout {
  type: string
  number: number
  init: object
}

export type GeoLayout =
  | ArrangementLayout
  | LinearLayout
  | CircularLayout
  | TriangularLayout
  | RectangularLayout
  | HexagonalLayout
  // | RegularPolygonLayout
  | CustomLayout
