import { GeolocusPointObject, createPolygonFromBBox } from '@/object'
import { describe, expect, test } from 'vitest'
import { Topology } from '../topology'

describe('Test the Topology class', () => {
  test('Return the intersection between two geometries with holes', () => {
    const point1 = new GeolocusPointObject([0, 0])
    const point2 = new GeolocusPointObject([0, 20])
    const buffer1 = Topology.bufferOfRange(point1, [5, 10])
    const buffer2 = Topology.bufferOfRange(point1, [8, 15])
    const buffer3 = Topology.bufferOfRange(point2, [1, 2])

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(Topology.intersection(buffer1!, buffer2!)).toBeTruthy()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(Topology.intersection(buffer1!, buffer3!)).toBeNull()
  })

  test('Return the buffer area of specified distance', () => {
    const point = new GeolocusPointObject([1000, 1000])
    expect(Topology.bufferOfDistance(point, 100)).toBeTruthy()
  })

  test('Return the buffer area of specified distance range', () => {
    const point = new GeolocusPointObject([1000, 1000])
    const polygon = createPolygonFromBBox([-1, -1, 1, 1])
    expect(Topology.bufferOfRange(point, [100, 200])).toBeTruthy()
    expect(Topology.bufferOfRange(polygon, [-10, 10])).toBeTruthy()
  })
})
