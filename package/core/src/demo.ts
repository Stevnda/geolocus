import { UserGeolocusTriple } from '.'
import { GeolocusGeometryType, Position2 } from './object'
import {
  TopologyRelation,
  SemanticDirection,
  EuclideanDistance,
  EuclideanDistanceRange,
  SemanticDistance,
  ComputeRegionRange,
  GeoLayout,
} from './relation'

// 单目标物地理对象描述模式约束规则
interface SingleObjectPatternRule {
  role: string
  tuple: {
    originList: (
      | {
          name?: string
          type?: GeolocusGeometryType
          coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
        }
      | UserGeolocusTriple
    )[]
    relation?: {
      topology?: TopologyRelation
      direction?: SemanticDirection | number
      distance?: EuclideanDistance | EuclideanDistanceRange | SemanticDistance
      range?: ComputeRegionRange
      layout?: GeoLayout
    }
  }
  target: string
}

// 多目标物地理对象描述模式约束规则
type MultiObjectPatternRule = {
  role: string
  originList: (
    | {
        name?: string
        type?: GeolocusGeometryType
        coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
      }
    | UserGeolocusTriple
  )[]
  relation?: {
    topology?: TopologyRelation
    direction?: SemanticDirection | number
    distance?: EuclideanDistance | EuclideanDistanceRange | SemanticDistance
    range?: ComputeRegionRange
    layout?: GeoLayout
  }
  target: string
}[]

// 特殊地理对象描述模式约束规则
interface LineObjectPatternRule {
  role: string
  tuple: {
    originList?: (
      | {
          name?: string
          type?: GeolocusGeometryType
          coord?: Position2 | Position2[] | Position2[][] | Position2[][][]
        }
      | UserGeolocusTriple
    )[]
    relation?: {
      topology?: TopologyRelation
      direction?: SemanticDirection | number
      distance?: EuclideanDistance | EuclideanDistanceRange | SemanticDistance
      range?: ComputeRegionRange
      layout?: GeoLayout
    }
  }
  target: string
}

export interface TT {
  a: SingleObjectPatternRule
  b: MultiObjectPatternRule
  c: LineObjectPatternRule
}
