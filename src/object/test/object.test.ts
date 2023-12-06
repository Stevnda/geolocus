/* eslint-disable @typescript-eslint/no-explicit-any */
import { GeolocusContext } from '../../context'
import { Compare } from '../../math'
import { GeolocusBBox } from '../../type'
import { GeoJSON } from '../geoJSON'
import {
  GeolocusLineStringObject,
  GeolocusMultiPolygonObject,
  GeolocusPointObject,
  GeolocusPolygonObject,
} from '../object'

describe('Test the GeolocusPointObject class', () => {
  const context = new GeolocusContext('default')
  const object0 = new GeolocusPointObject([1, 1])
  const object1 = new GeolocusPointObject([1, 1], context)
  expect(object0.getContext()).toBeNull()
  expect(object1.getContext()).toEqual(context)

  test('Get and set the fuzzy tag', () => {
    const object = new GeolocusPointObject([1, 1])
    expect(object.getFuzzy()).toBeFalsy()
    object.setFuzzy(true)
    expect(object.getFuzzy()).toBeTruthy()
  })

  test('Get the name', () => {
    const object = new GeolocusPointObject([1, 1])
    expect(object.getName()).toBe('')
  })

  test('Return the uuid', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getType()).toEqual('Point')
  })

  test('Return the vertex', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getVertex()).toEqual([1, 1])
  })

  test('Return the bbox', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getBBox()).toEqual([1, 1, 1, 1])
  })

  test('Return the center of object', () => {
    const object = new GeolocusPointObject([1, 1])
    const center = object.getCenter()

    expect(center).toEqual([1, 1])
  })

  test('Return the geometry', () => {
    const point = new GeolocusPointObject([1, 1])
    expect(point.getGeoJSON()).toEqual(GeoJSON.point([1, 1]))
  })

  test('Clone itself', () => {
    const object = new GeolocusPointObject([1, 1])
    const clone = object.clone()
    expect(clone.getVertex()).toEqual(object.getVertex())
  })

  test('Translate itself', () => {
    const object = new GeolocusPointObject([1, 1])
    object.translate([0, 0], [1, 1])
    expect(
      Compare.GE(object.getCenter()[0], 1.99) &&
        Compare.LE(object.getCenter()[0], 2.01),
    ).toBeTruthy()
  })

  test('Get the GeolocusPolygonObject from geojson', () => {
    const point = new GeolocusPointObject([1, 1])
    const polygon = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])

    expect(GeolocusPointObject.fromGeoJSON(point.getGeoJSON()).getType()).toBe(
      'Point',
    )
    expect(() =>
      GeolocusPointObject.fromGeoJSON(polygon.getGeoJSON() as any),
    ).toThrow()
  })
})

describe('Test the GeolocusLineStringObject class', () => {
  test('Get the context', () => {
    const context = new GeolocusContext('default')
    const object0 = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    const object1 = new GeolocusLineStringObject(
      [
        [1, 1],
        [1, 2],
      ],
      context,
    )
    expect(object0.getContext()).toBeNull()
    expect(object1.getContext()).toEqual(context)
  })

  test('Get and set the fuzzy tag', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getFuzzy()).toBeFalsy()
    object.setFuzzy(true)
    expect(object.getFuzzy()).toBeTruthy()
  })

  test('Get the name', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getName()).toBe('')
  })

  test('Return the uuid', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getType()).toEqual('LineString')
  })

  test('Return the vertex', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getVertex()).toEqual([
      [1, 1],
      [1, 2],
    ])
  })
  test('Return the bbox', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getBBox()).toEqual([1, 1, 1, 2])
  })

  test('Return the center of object', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 3],
    ])
    const center = object.getCenter()

    expect(center).toEqual([1, 2])
  })

  test('Return the geometry', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    expect(object.getGeoJSON()).toEqual(
      GeoJSON.lineString([
        [1, 1],
        [1, 2],
      ]),
    )
  })

  test('Clone itself', () => {
    const object = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    const clone = object.clone()
    expect(clone.getVertex()).toEqual(object.getVertex())
  })

  test('Translate itself', () => {
    const object = new GeolocusLineStringObject([
      [0, 0],
      [0, 2],
    ])
    object.translate([0, 0], [1, 1])
    expect(
      Compare.GE(object.getCenter()[0], 0.99) &&
        Compare.LE(object.getCenter()[0], 1.01),
    ).toBeTruthy()
  })

  test('Get the GeolocusPolygonObject from geojson', () => {
    const line = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    const polygon = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])

    expect(
      GeolocusLineStringObject.fromGeoJSON(line.getGeoJSON()).getType(),
    ).toBe('LineString')
    expect(() =>
      GeolocusLineStringObject.fromGeoJSON(polygon.getGeoJSON() as any),
    ).toThrow()
  })
})

describe('Test the GeolocusPolygonObject class', () => {
  test('Get the context', () => {
    const context = new GeolocusContext('default')
    const object0 = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    const object1 = new GeolocusPolygonObject(
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
      context,
    )
    expect(object0.getContext()).toBeNull()
    expect(object1.getContext()).toEqual(context)
  })

  test('Get and set the fuzzy tag', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getFuzzy()).toBeFalsy()
    object.setFuzzy(true)
    expect(object.getFuzzy()).toBeTruthy()
  })

  test('Get the name', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getName()).toBe('')
  })

  test('Return the uuid', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getType()).toEqual('Polygon')
  })

  test('Return the vertex', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getVertex()).toEqual([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
  })

  test('Clone itself', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    const clone = object.clone()
    expect(clone.getVertex()).toEqual(object.getVertex())
  })

  test('Return the bbox', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getBBox()).toEqual([1, 1, 1, 3])
  })

  test('Return the center of object', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    const center = object.getCenter()

    expect(center).toEqual([1, 2])
  })

  test('Return the geometry', () => {
    const object = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    expect(object.getGeoJSON()).toEqual(
      GeoJSON.polygon([
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ]),
    )
  })

  test('Translate itself', () => {
    const object = GeolocusPolygonObject.fromBBox([0, 0, 2, 2])
    object.translate([0, 0], [1, 1])
    expect(
      Compare.GE(object.getCenter()[0], 1.99) &&
        Compare.LE(object.getCenter()[0], 2.01),
    ).toBeTruthy()
  })

  test('Get the GeolocusPolygonObject from bbox', () => {
    const bbox: GeolocusBBox = [1, 2, 3, 4]
    const polygon = GeolocusPolygonObject.fromBBox(bbox)

    expect(polygon).toBeInstanceOf(GeolocusPolygonObject)
  })

  test('Get the GeolocusPolygonObject from geojson', () => {
    const line = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    const polygon = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])

    expect(
      GeolocusPolygonObject.fromGeoJSON(polygon.getGeoJSON()).getType(),
    ).toBe('Polygon')
    expect(() =>
      GeolocusPolygonObject.fromGeoJSON(line.getGeoJSON() as any),
    ).toThrow()
  })
})

describe('Test the GeolocusMultiPolygonObject class', () => {
  test('Get the context', () => {
    const context = new GeolocusContext('default')
    const object0 = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    const object1 = new GeolocusMultiPolygonObject(
      [
        [
          [
            [1, 1],
            [1, 2],
            [1, 3],
            [1, 1],
          ],
        ],
      ],
      context,
    )
    expect(object0.getContext()).toBeNull()
    expect(object1.getContext()).toEqual(context)
  })

  test('Get and set the fuzzy tag', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getFuzzy()).toBeFalsy()
    object.setFuzzy(true)
    expect(object.getFuzzy()).toBeTruthy()
  })

  test('Get the name', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getName()).toBe('')
  })

  test('Return the uuid', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getUUID()).toMatch(
      /^(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}|[a-f\d]{32})$/,
    )
  })

  test('Return the type', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getType()).toEqual('MultiPolygon')
  })

  test('Return the vertex', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getVertex()).toEqual([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
  })

  test('Return the bbox', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getBBox()).toEqual([1, 1, 1, 3])
  })

  test('Return the center of object', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    const center = object.getCenter()

    expect(center).toEqual([1, 2])
  })

  test('Return the geometry', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    expect(object.getGeoJSON()).toEqual(
      GeoJSON.multiPolygon([
        [
          [
            [1, 1],
            [1, 2],
            [1, 3],
            [1, 1],
          ],
        ],
      ]),
    )
  })

  test('Clone itself', () => {
    const object = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])
    const clone = object.clone()
    expect(clone.getVertex()).toEqual(object.getVertex())
  })

  test('Translate itself', () => {
    const object = GeolocusMultiPolygonObject.fromBBox([0, 0, 2, 2])
    object.translate([0, 0], [1, 1])
    expect(
      Compare.GE(object.getCenter()[0], 1.99) &&
        Compare.LE(object.getCenter()[0], 2.01),
    ).toBeTruthy()
  })

  test('Get the GeolocusMultiPolygonObject from bbox', () => {
    const bbox: GeolocusBBox = [1, 2, 3, 4]
    const polygon = GeolocusMultiPolygonObject.fromBBox(bbox)

    expect(polygon).toBeInstanceOf(GeolocusMultiPolygonObject)
  })

  test('Get the GeolocusPolygonObject from geojson', () => {
    const line = new GeolocusLineStringObject([
      [1, 1],
      [1, 2],
    ])
    const polygon = new GeolocusPolygonObject([
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 1],
      ],
    ])
    const multiPolygon = new GeolocusMultiPolygonObject([
      [
        [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 1],
        ],
      ],
    ])

    expect(
      GeolocusMultiPolygonObject.fromGeoJSON(polygon.getGeoJSON()).getType(),
    ).toBe('MultiPolygon')
    expect(
      GeolocusMultiPolygonObject.fromGeoJSON(
        multiPolygon.getGeoJSON(),
      ).getType(),
    ).toBe('MultiPolygon')
    expect(() =>
      GeolocusMultiPolygonObject.fromGeoJSON(line.getGeoJSON() as any),
    ).toThrow()
  })
})
