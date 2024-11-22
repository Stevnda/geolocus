import { GeolocusObject } from '@/object'

export interface ArrangementLayout {
  region: GeolocusObject
  space: {
    type: 'uniform' | 'random' | 'between'
    number: number
  }
}

export interface LinearLayout {
  region: GeolocusObject
  space: {
    type: 'straight'
    number: number
  }
  init: {
    length: number
  }
}

export interface CircularLayout {
  region: GeolocusObject
  space: {
    type: 'solid' | 'hollow' | 'annulus'
    number: number
  }
  init: {
    radius0: number
    radius1: number
  }
}

export interface TriangularLayout {
  region: GeolocusObject
  space: {
    type: 'solid' | 'hollow' | 'vFormation'
    number: number
  }
  init: {
    angle: number
    sideLength: number
  }
}

export interface RectangularLayout {
  region: GeolocusObject
  space: {
    type: 'solid' | 'hollow'
    number: number
  }
  init: {
    width: number
    height: number
  }
}

export interface HexagonalLayout {
  region: GeolocusObject
  space: {
    type: 'solid' | 'hollow'
    number: number
  }
  init: {
    sideLength: number
  }
}

export interface RegularPolygonLayout {
  region: GeolocusObject
  space: {
    type: number
    number: number
  }
  init: {
    sideLength: number
  }
}

export interface CustomLayout {
  region: GeolocusObject
  space: {
    type: string
    number: number
  }
  init: object
}
