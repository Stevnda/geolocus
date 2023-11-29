import * as turf from '@turf/turf'

const g = turf.polygon([
  [
    [1, 1],
    [1, 2],
    [3, 3],
    [6, 6],
    [1, 1],
  ],
])

console.log(turf.bbox(g))
