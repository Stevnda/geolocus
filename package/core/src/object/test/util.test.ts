import { expect, test } from 'vitest'
import { GeolocusPolygonObject } from '../object'
import { computeGeolocusObjectMaskGrid, createPolygonFromBBox } from '../util'

test('Create GeolocusPolygonObject from BBox', () => {
  const polygon = createPolygonFromBBox([0, 0, 1, 1])

  expect(polygon.getType()).toBe('Polygon')
  expect(polygon.getBBox()).toEqual([0, 0, 1, 1])
})

test('Create the mask gird of TGeolocusObject', () => {
  const polygon = new GeolocusPolygonObject([
    [
      [0, 0],
      [2, 2],
      [-1, 3],
      [0, 0],
    ],
  ])
  const gird = computeGeolocusObjectMaskGrid(polygon, 36)

  expect(gird[0][2]).toBe(1)
})
