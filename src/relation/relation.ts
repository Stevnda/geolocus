import { AbsoluteDirection } from './direction'
import { Distance } from './distance'
import { TopologyRelation } from './topology'

export interface IGeoRelation {
  topology: TopologyRelation | null
  direction: AbsoluteDirection | null
  distance: Distance | null
}
