import { describe, expect, test } from 'vitest'
import { GeolocusPointObject } from '../object'
import { Transformation } from '../transformation'

describe('Test Transformation', () => {
  test('Translate TGeolocusObject', () => {
    const point = new GeolocusPointObject([0, 0])
    const transform = Transformation.translate(point, 1, 1)

    expect(transform.getContext()).toEqual(point.getContext())
    expect(transform.getUUID()).toEqual(point.getUUID())
    expect(transform.getType()).toEqual(point.getType())
    expect(transform.getStatus()).toEqual(point.getStatus())
    expect(transform.getName()).toEqual(point.getName())
    expect(transform.getBBox()).toEqual([1, 1, 1, 1])
    expect(transform.getCenter()).toEqual([1, 1])
  })
})
