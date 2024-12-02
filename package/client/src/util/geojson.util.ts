import { Position2 } from '@geolocus/core'
import { GeoJSON } from 'geojson'

export const generatePointByCoord = (coord: Position2) => {
  const obj = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:3857',
      },
    },
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: coord,
        },
      },
    ],
  } as GeoJSON

  return obj
}

export const generateLineStringByCoordList = (coord: Position2[]) => {
  const obj = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:3857',
      },
    },
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coord,
        },
      },
    ],
  } as GeoJSON

  return obj
}

export const generatePolygonByCoordList = (coord: Position2[][]) => {
  const obj = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:3857',
      },
    },
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: coord,
        },
      },
    ],
  } as GeoJSON

  return obj
}
