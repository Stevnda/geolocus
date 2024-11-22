import concaveman from 'concaveman'

export const computeConcaveHull = (
  pointList: [number, number][],
  concavity = 2,
  lengthThreshold = 0,
): [number, number][] => {
  return <[number, number][]>concaveman(pointList, concavity, lengthThreshold)
}
