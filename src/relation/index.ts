import { AbsoluteDirection } from './direction'
import { Distance } from './distance'
import { TopologyRelation } from './topology'

export { AbsoluteDirection, RelativeDirection } from './direction'
export {
  Distance,
  EuclideanDistance,
  EuclideanDistanceRange,
  SemanticDistance,
} from './distance'
export { Topology, TopologyRelation } from './topology'
export interface IGeoRelation {
  topology: TopologyRelation | null
  direction: AbsoluteDirection | null
  distance: Distance | null
}
