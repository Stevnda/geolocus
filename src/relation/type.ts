import { AbsoluteDirection, RelativeDirection } from './direction'
import { Distance } from './distance'
import { TopologyRelation } from './topology'

export interface IGeoRelation {
  topology: TopologyRelation | null
  direction: AbsoluteDirection | RelativeDirection | null
  distance: Distance | null
}
