import {
  AbsoluteDirection,
  EuclideanDistance,
  EuclideanDistanceRange,
} from '../type'
import { TopologyRelation } from './topology'

export interface IGeoRelation {
  topology: TopologyRelation | null
  direction: AbsoluteDirection | null
  distance: EuclideanDistance | EuclideanDistanceRange | null
}
