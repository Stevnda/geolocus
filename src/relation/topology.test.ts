import { createWriteStream } from 'fs'
import {
  GeolocusLineStringObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'
import { Topology } from './topology'

describe('Test the Topology class', () => {
  test('To check whether two geometries are equal', () => {
    const g0 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    const g1 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    const g2 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [4, 4],
        [1, 1],
      ],
    ])

    expect(Topology.isEqual(g0, g1)).toBeTruthy()
    expect(Topology.isEqual(g0, g2)).toBeFalsy()
  })

  test('To check whether two geometries are intersect', () => {
    const g0 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    const g1 = new GeolocusPolygonObject([
      [
        [-1, -1],
        [1, 2],
        [3, 3],
        [1, 1],
        [-1, -1],
      ],
    ])
    const g2 = new GeolocusPointObject([10, 10])

    expect(Topology.isIntersect(g0, g1)).toBeTruthy()
    expect(Topology.isIntersect(g0, g2)).toBeFalsy()
  })

  test('To check whether two geometries are disjoint', () => {
    const g0 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [3, 3],
        [1, 1],
      ],
    ])
    const g1 = new GeolocusPolygonObject([
      [
        [-1, -1],
        [1, 2],
        [3, 3],
        [1, 1],
        [-1, -1],
      ],
    ])
    const g2 = new GeolocusPointObject([10, 10])

    expect(Topology.isDisjoint(g0, g2)).toBeTruthy()
    expect(Topology.isDisjoint(g0, g1)).toBeFalsy()
  })

  test('To check whether the first geometry is within the second geometry', () => {
    const g0 = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ])
    const g1 = new GeolocusPointObject([1, 2])
    const g2 = new GeolocusLineStringObject([
      [-1, 1],
      [2, 2],
      [1, -3],
      [3, 4],
    ])

    expect(Topology.isWithin(g1, g0)).toBeTruthy()
    expect(Topology.isWithin(g0, g2)).toBeFalsy()
  })

  test('To check whether the first geometry is contain the second geometry', () => {
    const g0 = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ])
    const g1 = new GeolocusPointObject([1, 2])
    const g2 = new GeolocusLineStringObject([
      [-1, 1],
      [2, 2],
      [1, -3],
      [3, 4],
    ])

    expect(Topology.isContains(g0, g1)).toBeTruthy()
    expect(Topology.isContains(g2, g0)).toBeFalsy()
  })

  test('To check whether the first geometry is touch the second geometry', () => {
    const g0 = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ])
    const g1 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 4],
        [3, 3],
        [2, 4],
        [1, 1],
      ],
    ])
    const g2 = new GeolocusPolygonObject([
      [
        [-1, 1],
        [4, 5],
        [2, 3],
        [-1, 1],
      ],
    ])

    expect(Topology.isTouch(g0, g1)).toBeTruthy()
    expect(Topology.isTouch(g0, g2)).toBeFalsy()
  })

  test('Return the intersection between two simple geometries', () => {
    const g0 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 3],
        [3, 3],
        [3, 1],
        [1, 1],
      ],
    ])
    const g1 = new GeolocusPolygonObject([
      [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
        [0, 0],
      ],
    ])
    const g2 = new GeolocusPolygonObject([
      [
        [10, 10],
        [12, 10],
        [12, 12],
        [10, 12],
        [10, 10],
      ],
    ])

    expect(
      Topology.intersection(g0, g1)?.getGeoJSON().geometry.coordinates,
    ).toEqual([
      [
        [
          [1, 1],
          [2, 1],
          [2, 2],
          [1, 2],
          [1, 1],
        ],
      ],
    ])

    expect(Topology.intersection(g0, g2)).toBeNull()
  })

  test('Return the intersection between two geometries with holes', () => {
    const point1 = new GeolocusPointObject([0, 0])
    const point2 = new GeolocusPointObject([0, 20])
    const buffer1 = Topology.bufferOfRange(point1, [5, 10])
    const buffer2 = Topology.bufferOfRange(point1, [8, 15])
    const buffer3 = Topology.bufferOfRange(point2, [1, 2])

    createWriteStream('./test.json', 'utf-8').write(
      JSON.stringify(Topology.intersection(buffer1, buffer2)),
    )
    expect(Topology.intersection(buffer1, buffer2)).toBeTruthy()
    expect(Topology.intersection(buffer1, buffer3)).toBeNull()
  })

  test('Return the buffer area of specified distance', () => {
    const point = new GeolocusPointObject([1000, 1000])
    expect(
      Topology.bufferOfDistance(point, 100).getGeoJSON().geometry.coordinates,
    ).toBeTruthy()
  })

  test('Return the buffer area of specified distance range', () => {
    const point = new GeolocusPointObject([1000, 1000])
    expect(
      Topology.bufferOfRange(point, [100, 200]).getGeoJSON().geometry
        .coordinates,
    ).toBeTruthy()
  })
})
