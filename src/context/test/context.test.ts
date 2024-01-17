import { GeolocusPointObject } from '@/object'
import { Region } from '@/region'
import { Relation } from '@/relation'
import { randomUUID } from 'crypto'
import { describe, expect, test } from 'vitest'
import { GeolocusContext } from '../context'
import { Route } from '../route'

describe('Test GeolocusContext', () => {
  test('Add object and get object', () => {
    const context = new GeolocusContext()
    const uuid = randomUUID()
    const point = new GeolocusPointObject([1, 1])
    context.getObjectMap().set(uuid, point)
    expect(context.getObjectMap()).toBeInstanceOf(Map)
    expect(context.getObjectByObjectUUID(uuid)?.getType()).toBe('Point')
  })

  test('Get route', () => {
    const context = new GeolocusContext()
    expect(context.getRoute()).toBeInstanceOf(Route)
  })

  test('Get relation', () => {
    const context = new GeolocusContext()
    expect(context.getRelation()).toBeInstanceOf(Relation)
  })

  test('Get region', () => {
    const context = new GeolocusContext()
    expect(context.getRegion()).toBeInstanceOf(Region)
  })

  test('Get name', () => {
    const context = new GeolocusContext()
    expect(context.getName()).toBe('default')
  })

  test('Get distanceDelta', () => {
    const context = new GeolocusContext()
    expect(context.getDistanceDelta()).toBe(0.2)
  })

  test('Get directionDelta', () => {
    const context = new GeolocusContext()
    expect(context.getDirectionDelta()).toBeInstanceOf(Object)
  })

  test('Get semanticDistanceMap', () => {
    const context = new GeolocusContext()
    expect(context.getSemanticDistanceMap()).toBeInstanceOf(Array)
  })

  test('Get resultGirdNum', () => {
    const context = new GeolocusContext()
    expect(context.getResultGirdNum()).toBe(16384)
  })
})
