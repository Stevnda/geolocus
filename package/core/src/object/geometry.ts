import jsts from '@geolocus/jsts'
import { GeolocusBBox, GeolocusGeometryType, Position2 } from './object.type'
import { MAGIC_NUMBER } from '@/util'
import { Topology } from '@/relation'
import { computeConcaveHull } from '@geolocus/concave'

interface GeolocusGeometryProps {
  setType(value: GeolocusGeometryType): void
  getType(): GeolocusGeometryType
  setGeometry(value: jsts.geom.Geometry): void
  getGeometry(): jsts.geom.Geometry
  setBBox(value: GeolocusBBox): void
  getBBox(): GeolocusBBox
  setCenter(value: Position2): void
  getCenter(): Position2
}

export class GeolocusGeometry implements GeolocusGeometryProps {
  private _type: GeolocusGeometryType
  private _geometry: jsts.geom.Geometry
  private _bbox: GeolocusBBox
  private _center: Position2

  constructor(type: GeolocusGeometryType, geometry: jsts.geom.Geometry) {
    this._type = type
    this._geometry = geometry
    this._bbox = JTSGeometryAction.getBBox(geometry)
    this._center = JTSGeometryAction.getCenter(geometry)
  }

  setType(value: GeolocusGeometryType): void {
    this._type = value
  }

  getType(): GeolocusGeometryType {
    return this._type
  }

  setGeometry(value: jsts.geom.Geometry): void {
    this._geometry = value
  }

  getGeometry(): jsts.geom.Geometry {
    return this._geometry
  }

  setBBox(value: GeolocusBBox): void {
    this._bbox = value
  }

  getBBox(): GeolocusBBox {
    return this._bbox
  }

  setCenter(value: Position2): void {
    this._center = value
  }

  getCenter(): Position2 {
    return this._center
  }

  getArea(): number {
    return JTSGeometryAction.getArea(this._geometry)
  }

  getCoordList(): Position2[] {
    return JTSGeometryAction.getCoordList(this._geometry)
  }
}

export class GeolocusGeometryAction {
  static translate(
    geometry: GeolocusGeometry,
    x: number,
    y: number,
  ): GeolocusGeometry {
    const affineTransformation = new jsts.geom.util.AffineTransformation()
    affineTransformation.translate(x, y)
    const geometryTranslated = affineTransformation.transform(
      geometry.getGeometry(),
    )
    const type = geometry.getType()

    return new GeolocusGeometry(type, geometryTranslated)
  }

  static rotateAroundCoord(
    geometry: GeolocusGeometry,
    azimuth: number,
    coord: Position2,
  ) {
    const affineTransformation = new jsts.geom.util.AffineTransformation()
    affineTransformation.rotate(-azimuth, ...coord)
    const geometryRotated = affineTransformation.transform(
      geometry.getGeometry(),
    )
    const type = geometry.getType()

    return new GeolocusGeometry(type, geometryRotated)
  }

  static getConvexHull(geometry: GeolocusGeometry) {
    geometry = <GeolocusGeometry>(
      Topology.bufferOfDistance(geometry, MAGIC_NUMBER)
    )
    return new GeolocusGeometry(
      'Polygon',
      JTSGeometryAction.getConvexHull(geometry.getGeometry()),
    )
  }

  static getConvexHullByGeometryList(geometryList: GeolocusGeometry[]) {
    const convexHullArray = geometryList.map((geometry) => {
      geometry = <GeolocusGeometry>(
        Topology.bufferOfDistance(geometry, MAGIC_NUMBER)
      )
      return JTSGeometryAction.getConvexHull(geometry.getGeometry())
    })

    const multiPolygon =
      JTSGeometryFactory.multiPolygonByPolygonList(convexHullArray)
    const convexHull = JTSGeometryAction.getConvexHull(multiPolygon)

    return new GeolocusGeometry('Polygon', convexHull)
  }

  static getConcaveHull(
    geometry: GeolocusGeometry,
    concavity = 2,
  ): GeolocusGeometry {
    const geometryType = geometry.getType()
    if (geometryType === 'Point' || geometryType === 'LineString')
      return geometry

    const jtsGeometry = geometry.getGeometry()
    const pointList = JTSGeometryAction.getCoordList(jtsGeometry)
    if (pointList.length === 1)
      return new GeolocusGeometry(
        'Point',
        JTSGeometryFactory.point(pointList[0]),
      )
    if (pointList.length === 2)
      return new GeolocusGeometry(
        'LineString',
        JTSGeometryFactory.lineString(pointList),
      )

    const hull = <Position2[]>computeConcaveHull(pointList, concavity)

    return new GeolocusGeometry('Polygon', JTSGeometryFactory.polygon([hull]))
  }

  static densify(
    geometry: GeolocusGeometry,
    distanceTolerance: number,
  ): GeolocusGeometry {
    const jtsGeometry = geometry.getGeometry()
    const densified = JTSGeometryAction.densify(jtsGeometry, distanceTolerance)
    return new GeolocusGeometry(geometry.getType(), densified)
  }
}

export class JTSGeometryFactory {
  private static _geometryFactory = new jsts.geom.GeometryFactory()

  static point = (position: Position2): jsts.geom.Geometry => {
    const coord = new jsts.geom.Coordinate(...position)
    return this._geometryFactory.createPoint(coord)
  }

  static lineString = (position: Position2[]): jsts.geom.Geometry => {
    const coord = position.map((value) => new jsts.geom.Coordinate(...value))
    return this._geometryFactory.createLineString(coord)
  }

  static polygon = (position: Position2[][]): jsts.geom.Geometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createPolygon(
      lineStringArray[0],
      lineStringArray.slice(1),
    )
  }

  static multiPoint = (position: Position2[]): jsts.geom.Geometry => {
    const pointArray = position.map((value) => this.point(value))
    return this._geometryFactory.createMultiPoint(pointArray)
  }

  static multiLineString = (position: Position2[][]): jsts.geom.Geometry => {
    const lineStringArray = position.map((value) => this.lineString(value))
    return this._geometryFactory.createMultiLineString(lineStringArray)
  }

  static multiPolygon = (position: Position2[][][]): jsts.geom.Geometry => {
    const polygonArray = position.map((value) => this.polygon(value))
    return this._geometryFactory.createMultiPolygon(polygonArray)
  }

  static multiPolygonByPolygonList(polygonArray: jsts.geom.Geometry[]) {
    return this._geometryFactory.createMultiPolygon(polygonArray)
  }

  static bbox(bbox: GeolocusBBox) {
    const leftDown: Position2 = [bbox[0], bbox[1]]
    const rightDown: Position2 = [bbox[2], bbox[1]]
    const rightUp: Position2 = [bbox[2], bbox[3]]
    const leftUp: Position2 = [bbox[0], bbox[3]]

    return this.polygon([[leftDown, rightDown, rightUp, leftUp, leftDown]])
  }

  static empty(type: GeolocusGeometryType) {
    const map = {
      Point: this._geometryFactory.createPoint(),
      LineString: this._geometryFactory.createLineString(),
      Polygon: this._geometryFactory.createPolygon(),
      MultiPoint: this._geometryFactory.createMultiPoint(),
      MultiLineString: this._geometryFactory.createMultiLineString(),
      MultiPolygon: this._geometryFactory.createMultiPolygon(),
    }

    const factory = map[type]
    return factory
  }

  static create(
    type: GeolocusGeometryType,
    coord: Position2 | Position2[] | Position2[][] | Position2[][][],
  ) {
    const map = {
      Point: this.point,
      LineString: this.lineString,
      Polygon: this.polygon,
      MultiPoint: this.multiPoint,
      MultiLineString: this.multiLineString,
      MultiPolygon: this.multiPolygon,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factory = map[type](coord as any)

    return factory
  }
}

export class JTSGeometryAction {
  static getArea(geometry: jsts.geom.Geometry): number {
    return geometry.getArea()
  }

  static getCoordList(geometry: jsts.geom.Geometry): Position2[] {
    const coordList = geometry.getCoordinates()
    return coordList.map((coord) => [coord.x, coord.y])
  }

  static getBBox(geometry: jsts.geom.Geometry): GeolocusBBox {
    const envelope = geometry.getEnvelopeInternal()
    const minX = envelope.getMinX()
    const maxX = envelope.getMaxX()
    const minY = envelope.getMinY()
    const maxY = envelope.getMaxY()

    return [minX, minY, maxX, maxY]
  }

  static getCenter(geometry: jsts.geom.Geometry): Position2 {
    if (geometry.isEmpty()) return [0, 0]
    const center = jsts.algorithm.Centroid.getCentroid(geometry)
    return [center.x, center.y]
  }

  static getConvexHull(geometry: jsts.geom.Geometry): jsts.geom.Geometry {
    const convexHull = new jsts.algorithm.ConvexHull(geometry)
    return convexHull.getConvexHull()
  }

  static densify(
    geometry: jsts.geom.Geometry,
    distanceTolerance: number,
  ): jsts.geom.Geometry {
    return jsts.densify.Densifier.densify(geometry, distanceTolerance)
  }
}
