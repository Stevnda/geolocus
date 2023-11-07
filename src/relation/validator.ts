/* eslint-disable @typescript-eslint/no-unused-vars */
import { IGeoRelation } from '.'
const topologyHandler = (relation: IGeoRelation) => {
  //
}

const directionHandler = (relation: IGeoRelation) => {
  //
}

const distanceHandler = (relation: IGeoRelation) => {
  //
}

const topologyDirectionHandler = (relation: IGeoRelation) => {
  //
}

const topologyDistanceHandler = (relation: IGeoRelation) => {
  //
}

const directionDistanceHandler = (relation: IGeoRelation) => {
  //
}

const allHandler = (relation: IGeoRelation) => {
  //
}

const relationHandler = {
  1: topologyHandler,
  3: directionHandler,
  7: distanceHandler,
  4: topologyDirectionHandler,
  8: topologyDistanceHandler,
  10: directionDistanceHandler,
  11: allHandler,
}

const relationFilter = (relation: IGeoRelation) => {
  const topologyTag = typeof relation.topology === 'string' ? 1 : 0
  const directionTag = typeof relation.direction === 'string' ? 3 : 0
  const distanceTag = typeof relation.direction === 'number' ? 7 : 0

  const sum = (topologyTag +
    directionTag +
    distanceTag) as keyof typeof relationHandler
  const handler = relationHandler[sum]

  return handler(relation)
}
