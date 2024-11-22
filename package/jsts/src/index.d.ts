/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace jsts {
  export const version: string

  namespace algorithm {
    import Coordinate = jsts.geom.Coordinate
    import Geometry = jsts.geom.Geometry

    export class Centroid {
      constructor()
      static getCentroid(geom: Geometry): Coordinate
    }

    export class ConvexHull {
      constructor(geom: Geometry)
      getConvexHull(): Geometry
    }
  }

  namespace geom {
    export class PrecisionModel {
      static FIXED: string
      static FLOATING: string
      static FLOATING_SINGLE: string
      constructor(modelType?: number | string)
    }

    export class GeometryFactory {
      constructor(precisionModel?: PrecisionModel)

      createLineString(): LineString
      createLineString(coordinates: Coordinate[]): LineString
      createLineString(coordinates: CoordinateSequence): LineString

      createPoint(): Point
      createPoint(coordinates: Coordinate): Point
      createPoint(coordinates: CoordinateSequence): Point

      createMultiPoint(): MultiPoint
      createMultiPoint(point: Point[]): MultiPoint
      createMultiPoint(coordinates: Coordinate[]): MultiPoint
      createMultiPoint(coordinates: CoordinateSequence): MultiPoint

      createLinearRing(): LinearRing
      createLinearRing(coordinates: Coordinate[]): LinearRing
      createLinearRing(coordinates: CoordinateSequence): LinearRing

      createPolygon(shell: LinearRing, holes: LinearRing[]): Polygon
      createPolygon(shell: CoordinateSequence): Polygon
      createPolygon(shell: Coordinate[]): Polygon
      createPolygon(shell: LinearRing): Polygon
      createPolygon(): Polygon

      createMultiPolygon(): MultiPolygon
      createMultiPolygon(polygons: Polygon[]): MultiPolygon
      createMultiLineString(): MultiLineString
      createMultiLineString(lineStrings: LineString[]): MultiLineString
    }

    export class GeometryCollection extends jsts.geom.Geometry {
      constructor(geometries?: Geometry[], factory?: GeometryFactory)
    }

    export class Coordinate {
      constructor(x: number, y: number)
      constructor(c: Coordinate)
      constructor()
      constructor(x: number, y: number, z: number)
      x: number
      y: number
      z: number
    }

    export class CoordinateSequence {
      static X: number
      static Y: number
      static Z: number
      static M: number
    }

    export interface CoordinateSequenceFactory {
      create(coordinates: Coordinate[]): CoordinateSequence
      create(coordSeq: CoordinateSequence): CoordinateSequence
      create(size: number, dimension: number): CoordinateSequence
      create(
        size: number,
        dimension: number,
        measures: number,
      ): CoordinateSequence
    }

    export class Envelope {
      constructor(x1: number, x2: number, y1: number, y2: number)
      constructor(p1: Coordinate, p2: Coordinate)
      constructor(p: Coordinate)
      constructor(env: Envelope)
      getMinX(): number
      getMaxX(): number
      getMinY(): number
      getMaxY(): number
    }

    export class Geometry {
      constructor(factory?: any)
      envelope: Envelope
      getArea(): number
      getGeometryType(): string
      getCoordinate(): Coordinate
      getCoordinates(): Coordinate[]
      isEmpty(): boolean
      getEnvelopeInternal(): Envelope
      equal(a: Coordinate, b: Coordinate, tolerance: number): boolean
    }

    export class LinearRing extends LineString {}

    export class LineString extends Geometry {
      constructor(points: Coordinate[], factory?: any)
    }

    export class MultiLineString extends GeometryCollection {
      constructor(lineStrings: LineString[], factory: GeometryFactory)

      constructor(
        lineStrings: LineString[],
        precisionModel: PrecisionModel,
        SRID: number,
      )
    }

    export class Point extends Geometry {
      constructor(coordinate: Coordinate, factory?: any)
    }

    export class MultiPoint extends GeometryCollection {
      constructor(points: Point[], factory: GeometryFactory)
      constructor(points: Point[], precisionModel: PrecisionModel, SRID: number)
    }

    export class Polygon extends Geometry {
      constructor(shell: LinearRing, holes?: LinearRing[], factory?: any)
    }

    export class MultiPolygon extends GeometryCollection {
      constructor(polygons: null | Polygon[], factory: GeometryFactory)
    }

    namespace util {
      export class AffineTransformation {
        constructor(trans?: AffineTransformation)
        constructor(
          m00: number,
          m01: number,
          m02: number,
          m10: number,
          m11: number,
          m12: number,
        )
        constructor(
          src0: Coordinate,
          src1: Coordinate,
          src2: Coordinate,
          dest0: Coordinate,
          dest1: Coordinate,
          dest2: Coordinate,
        )
        rotate(theta: number): AffineTransformation
        rotate(sinTheta: number, cosTheta: number): AffineTransformation
        rotate(theta: number, x: number, y: number): AffineTransformation
        rotate(
          sinTheta: number,
          cosTheta: number,
          x: number,
          y: number,
        ): AffineTransformation
        translate(x: number, y: number): AffineTransformation
        transform<T extends Geometry>(g: T): T
        transform(src: Coordinate, dest: Coordinate): Coordinate
        transform(seq: CoordinateSequence, i: number): void
      }
    }
    export class LineSegment {
      constructor(p0: Coordinate, p1: Coordinate)
    }
  }

  namespace io {
    export class GeoJSONReader {
      constructor(geometryFactory?: jsts.geom.GeometryFactory)
      read(geometry: object): geom.Geometry
    }
    export class GeoJSONWriter {
      constructor()

      write(geometry: geom.Geometry): object
    }
  }

  namespace operation {
    namespace buffer {
      import Geometry = jsts.geom.Geometry
      export class BufferOp {
        constructor(g: Geometry)
        static bufferOp(g: Geometry, distance: number): Geometry
      }
    }
    namespace distance {
      import Geometry = jsts.geom.Geometry
      export class DistanceOp {
        constructor(g0: Geometry, g1: Geometry)
        constructor(g0: Geometry, g1: Geometry, terminateDistance: number)
        static distance(g0: Geometry, g1: Geometry): number
        static nearestPoints(g0, g1): [Coordinate, Coordinate]
      }
    }
    namespace overlay {
      import Geometry = jsts.geom.Geometry
      export class OverlayOp {
        static union(geom: Geometry, other: Geometry): Geometry
        static intersection(geom: Geometry, other: Geometry): Geometry
        static difference(geom: Geometry, other: Geometry): Geometry
      }
    }
  }
}

export default jsts
