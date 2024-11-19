import Centroid from 'jsts/org/locationtech/jts/algorithm/Centroid'
import ConvexHull from 'jsts/org/locationtech/jts/algorithm/ConvexHull'
import Coordinate from 'jsts/org/locationtech/jts/geom/Coordinate.js'
import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js'
import AffineTransformation from 'jsts/org/locationtech/jts/geom/util/AffineTransformation.js'
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js'
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js'
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js'
import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp.js'
import OverlayOp from 'jsts/org/locationtech/jts/operation/overlay/OverlayOp.js'

const jsts = {
  algorithm: {
    Centroid,
    ConvexHull,
  },
  geom: {
    Coordinate,
    GeometryFactory,
    util: {
      AffineTransformation,
    },
  },
  io: {
    GeoJSONReader,
    GeoJSONWriter,
  },
  operation: {
    buffer: { BufferOp },
    distance: { DistanceOp },
    overlay: { OverlayOp },
  },
}

export default jsts
