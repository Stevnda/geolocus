import {
  computeGeolocusObjectMaskGrid,
  GeolocusGeometry,
  GeolocusObject,
  Position2,
} from '@/object'
import { Distance } from '@/relation'
import { GeolocusGird, Gird, Vector2 } from '@/util'
import { RegionPDFInput } from './region.type'
import { JTSGeometryFactory } from '@/object/geometry'

export class RegionPDF {
  private static computeNormalDistributionValue(
    x: number,
    mean: number,
    std: number,
  ) {
    const exponent = (Math.pow(x - mean, 2) / Math.pow(std, 2)) * -0.5
    // const coefficient = 1 / (std * Math.sqrt(2 * Math.PI))
    // const result = coefficient * Math.exp(exponent)
    const result = Math.exp(exponent)

    return result
  }

  private static computeBivariateNormalDistributionValue(
    x: number,
    meanX: number,
    stdX: number,
    y: number,
    meanY: number,
    stdY: number,
  ) {
    const exponent =
      (Math.pow(x - meanX, 2) / Math.pow(stdX, 2) +
        Math.pow(y - meanY, 2) / Math.pow(stdY, 2)) *
      -0.5
    // const coefficient = 1 / (2 * Math.PI * stdX * stdY)
    // const result = coefficient * Math.exp(exponent)
    const result = Math.exp(exponent)

    return result
  }

  private static distance(
    origin: GeolocusObject,
    target: GeolocusObject,
    distance: number,
    delta: number,
  ) {
    const x = Distance.distance(origin.getGeometry(), target.getGeometry())

    return this.computeNormalDistributionValue(x, distance, delta / 2)
  }

  private static angle(
    origin: GeolocusObject,
    target: GeolocusObject,
    azimuth: number,
    delta: number,
  ) {
    const radiansTransform = -azimuth + Math.PI / 2
    const v1 = Vector2.sub(
      target.getGeometry().getCenter(),
      origin.getGeometry().getCenter(),
    )
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]
    const radians = Vector2.angleTo(v1, v2)

    return this.computeNormalDistributionValue(radians, 0, delta / 2)
  }

  private static distanceAndAngle(
    origin: GeolocusObject,
    target: GeolocusObject,
    distance: number,
    deltaDistance: number,
    azimuth: number,
    deltaAzimuth: number,
  ) {
    const x = Distance.distance(origin.getGeometry(), target.getGeometry())

    const radiansTransform = -azimuth + Math.PI / 2
    const v1 = Vector2.sub(
      target.getGeometry().getCenter(),
      origin.getGeometry().getCenter(),
    )
    const v2: Position2 = [
      Math.cos(radiansTransform),
      Math.sin(radiansTransform),
    ]
    const radians = Vector2.angleTo(v1, v2)

    return this.computeBivariateNormalDistributionValue(
      x,
      distance,
      deltaDistance / 2,
      radians,
      0,
      deltaAzimuth / 2,
    )
  }

  private static sdfCompare(
    gird: GeolocusGird,
    originRow: number,
    originCol: number,
    rowOffset: number,
    colOffset: number,
  ) {
    const row = gird.length
    const col = gird[0].length
    let other = 9999
    const targetRow = originRow + rowOffset
    const targetCol = originCol + colOffset
    if (targetRow >= 0 && targetCol > 0 && targetRow < row && targetCol < col) {
      other = gird[targetRow][targetCol]
    }

    const compareValue =
      other + Vector2.distanceTo([0, 0], [rowOffset, colOffset])
    if (gird[originRow][originCol] > compareValue) {
      gird[originRow][originCol] = compareValue
    }
  }

  private static getUnsignedInternalDistanceField(
    pdf: RegionPDFInput,
    azimuth?: number,
    deltaAzimuth?: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mask = computeGeolocusObjectMaskGrid(
      pdf.sdf.girdRegion as GeolocusObject,
      pdf.sdf.girdNum as number,
    )
    const tempGird = Gird.createGirdWithFilter(
      mask.length + 4,
      mask[0].length + 4,
      (row, col) => {
        if (
          row <= 1 ||
          col <= 1 ||
          row >= mask.length + 2 ||
          col >= mask[0].length + 2
        ) {
          return 0
        } else {
          return mask[row - 2][col - 2] ? 9999 : 0
        }
      },
    )

    for (let row = 0; row < tempGird.length; row++) {
      for (let col = 0; col < tempGird[0].length; col++) {
        this.sdfCompare(tempGird, row, col, 0, -1)
        this.sdfCompare(tempGird, row, col, -1, 0)
        this.sdfCompare(tempGird, row, col, -1, -1)
        this.sdfCompare(tempGird, row, col, -1, 1)
      }
      for (let col = tempGird[0].length - 1; col >= 0; col--) {
        this.sdfCompare(tempGird, row, col, 0, 1)
      }
    }

    for (let row = tempGird.length - 1; row >= 0; row--) {
      for (let col = tempGird[0].length - 1; col >= 0; col--) {
        this.sdfCompare(tempGird, row, col, 0, 1)
        this.sdfCompare(tempGird, row, col, 1, 0)
        this.sdfCompare(tempGird, row, col, 1, -1)
        this.sdfCompare(tempGird, row, col, 1, 1)
      }
      for (let col = 0; col < tempGird[0].length; col++) {
        this.sdfCompare(tempGird, row, col, 0, -1)
      }
    }

    if (azimuth != null && deltaAzimuth != null) {
      const radiansTransform = -azimuth + Math.PI / 2
      const center: Position2 = [
        Math.floor(tempGird[0].length / 2),
        Math.floor(tempGird.length / 2),
      ]
      const resultGird = Gird.createGirdWithFilter(
        mask.length,
        mask[0].length,
        (row, col) => {
          const v1 = Vector2.sub([col, row], center)
          const v2: Position2 = [
            Math.cos(radiansTransform),
            Math.sin(radiansTransform),
          ]
          const radians = Vector2.angleTo(v1, v2)

          const pdf = this.computeNormalDistributionValue(
            radians,
            0,
            deltaAzimuth / 2,
          )
          return tempGird[row + 2][col + 2] + pdf / 10
        },
      )
      return resultGird
    } else {
      const resultGird = Gird.createGirdWithFilter(
        mask.length,
        mask[0].length,
        (row, col) => {
          return tempGird[row + 2][col + 2]
        },
      )
      return resultGird
    }
  }

  static computePDF(pdf: RegionPDFInput): GeolocusGird
  static computePDF(pdf: RegionPDFInput, target?: Position2): number
  static computePDF(
    pdf: RegionPDFInput,
    target?: Position2,
  ): number | GeolocusGird {
    const type = pdf.type
    const origin = pdf.origin
    let targetObject = null
    if (target) {
      const jtsGeometry = JTSGeometryFactory.point(target)
      const geolocusGeometry = new GeolocusGeometry('Point', jtsGeometry)
      targetObject = new GeolocusObject(geolocusGeometry)
    }
    const map = {
      distance: () =>
        this.distance(
          origin,
          targetObject as GeolocusObject,
          pdf.gdf.distance as number,
          pdf.gdf.distanceDelta as number,
        ),
      angle: () =>
        this.angle(
          origin,
          targetObject as GeolocusObject,
          pdf.gdf.azimuth as number,
          pdf.gdf.azimuthDelta as number,
        ),
      distanceAndAngle: () =>
        this.distanceAndAngle(
          origin,
          targetObject as GeolocusObject,
          pdf.gdf.distance as number,
          pdf.gdf.distanceDelta as number,
          pdf.gdf.azimuth as number,
          pdf.gdf.azimuthDelta as number,
        ),
      sdf: () =>
        this.getUnsignedInternalDistanceField(
          pdf,
          pdf.gdf.azimuth,
          pdf.gdf.azimuthDelta,
        ),
    }

    return map[type]()
  }
}
