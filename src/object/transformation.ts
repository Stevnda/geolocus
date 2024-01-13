/* eslint-disable @typescript-eslint/no-explicit-any */
import { GeolocusObject } from '@/type'
import * as jsts from 'jsts'
import { geolocusObjectMapping } from '.'
import { GeolocusGeometryMeta } from './geometry'

export class Transformation {
  static translate(
    object: GeolocusObject,
    x: number,
    y: number,
  ): GeolocusObject {
    const affineTransformation = new jsts.geom.util.AffineTransformation()
    affineTransformation.translate(x, y)
    const geometry = affineTransformation.transform(object.getGeometry())

    const bbox = GeolocusGeometryMeta.getBBox(geometry)
    const center = GeolocusGeometryMeta.getCenter(geometry, bbox)
    const type = object.getType()
    const ObjectFactory = geolocusObjectMapping[type]
    const objectTranslated = new ObjectFactory([0, 0] as any, {
      type: type as any,
      bbox,
      center,
      context: object.getContext(),
      geometry,
      name: object.getName(),
      status: object.getStatus(),
      uuid: object.getUUID(),
    })

    return objectTranslated
  }
}
