/* eslint-disable @typescript-eslint/no-explicit-any */
import { Position2 } from '@/context'
import jsts from '@geolocus/jsts'
import { GeolocusObject, geolocusObjectMapping } from '.'
import { GeolocusGeometryMeta } from './geometry'

export class Transformation {
  static translate = (
    object: GeolocusObject,
    x: number,
    y: number,
  ): GeolocusObject => {
    const affineTransformation = new jsts.geom.util.AffineTransformation()
    affineTransformation.translate(x, y)
    const geometry = affineTransformation.transform(object.getGeometry())

    const bbox = GeolocusGeometryMeta.getBBox(geometry)
    const center = GeolocusGeometryMeta.getCenter(geometry)
    const type = object.getType()
    const ObjectFactory = geolocusObjectMapping[type]
    const objectTranslated = new ObjectFactory(null as never, {
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

  static rotateAroundCoord = (
    object: GeolocusObject,
    theta: number,
    coord: Position2,
  ) => {
    const affineTransformation = new jsts.geom.util.AffineTransformation()
    affineTransformation.rotate(-theta, ...coord)
    const geometry = affineTransformation.transform(object.getGeometry())

    const bbox = GeolocusGeometryMeta.getBBox(geometry)
    const center = GeolocusGeometryMeta.getCenter(geometry)
    const type = object.getType()
    const ObjectFactory = geolocusObjectMapping[type]
    const objectTranslated = new ObjectFactory(null as never, {
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
