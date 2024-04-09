/* eslint-disable @typescript-eslint/no-explicit-any */
import { TPosition2 } from '@/context'
import jsts from '@geolocus/jsts'
import { TGeolocusObject, geolocusObjectMapping } from '.'
import { GeolocusGeometryMeta } from './geometry'

export class Transformation {
  static translate = (
    object: TGeolocusObject,
    x: number,
    y: number,
  ): TGeolocusObject => {
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
    object: TGeolocusObject,
    theta: number,
    coord: TPosition2,
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
