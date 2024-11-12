import { GeolocusObject } from '@/object'

export interface UniformLayout {
  region: GeolocusObject
  type: 'tri' | 'rect' | 'hex' | 'voronoi'
  space: {
    type: 'gap' | 'number'
    value: number
  }
}

export interface CircularLayout {
  region: GeolocusObject
  type: 'circle' | 'ellipse' | 'annulus'
  space: {
    type: 'gap' | 'number'
    value: number
  }
  init: {
    fill: boolean
    radius0: number
    radius1?: number
  }
}

export interface TriangularLayout {
  region: GeolocusObject
  type: 'tri' | 'vFormation'
  space: {
    type: 'gap' | 'number'
    value: number
  }
  init: {
    fill: boolean
    angle: number
    sideLength: number
  }
}

export interface RectangularLayout {
  region: GeolocusObject
  type: 'rect' | 'square'
  space: {
    type: 'gap' | 'number'
    value: number
  }
  init: {
    fill: boolean
    width: number
    height: number
  }
}

export interface HexagonalLayout {
  region: GeolocusObject
  type: 'hex'
  space: {
    type: 'gap' | 'number'
    value: number
  }
  init: {
    fill: boolean
    sideLength: number
  }
}

export interface RegularPolygonLayout {
  region: GeolocusObject
  type: number
  space: {
    type: 'gap' | 'number'
    value: number
  }
  init: {
    fill: boolean
    sideLength: number
  }
}

export interface CustomLayout {
  region: GeolocusObject
  type: number
  space: {
    type: 'gap' | 'number'
    value: number
  }
  init: object
}
