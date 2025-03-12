import { ImageSource } from 'mapbox-gl'
import { GeoJSON } from 'geojson'
import { Position2 } from '@geolocus/core/dist'

type MapStyle = mapboxgl.CircleLayerSpecification['paint'] &
  mapboxgl.LineLayerSpecification['paint'] &
  mapboxgl.FillLayerSpecification['paint']

export const addGeoJSONToMap = (
  map: mapboxgl.Map,
  dataID: string,
  geojson: GeoJSON,
  type: 'circle' | 'line' | 'fill',
  style?: MapStyle,
) => {
  let paint = {}
  if (style) {
    paint = style
  } else if (type === 'circle') {
    paint = { 'circle-color': '#ca8a04' }
  } else if (type === 'line') {
    paint = {
      'line-color': '#ca8a04',
    }
  } else {
    paint = {
      'fill-outline-color': '#4d7c0f',
      'fill-color': '#facc15',
      'fill-opacity': 0.5,
    }
  }
  map.addSource(dataID, {
    type: 'geojson',
    data: geojson as GeoJSON,
  })
  map.addLayer({
    id: dataID,
    type,
    source: dataID,
    layout: {
      visibility: 'visible',
    },
    paint,
  })
}

export const addImageToMap = (
  map: mapboxgl.Map,
  dataID: string,
  blob: Blob,
  extent: number[],
  opacity = 0.6,
) => {
  const url = window.URL.createObjectURL(blob)
  map.addSource(dataID, {
    type: 'image',
    url,
    coordinates: [
      [extent[0], extent[1]],
      [extent[2], extent[1]],
      [extent[2], extent[3]],
      [extent[0], extent[3]],
    ],
  })
  map.addLayer({
    id: dataID,
    type: 'raster',
    source: dataID,
    paint: {
      'raster-opacity': opacity,
    },
  })
}

export const addImageSequenceToMap = (
  map: mapboxgl.Map,
  dataID: string,
  blobList: Blob[],
  extent: number[],
) => {
  let time = 0
  const length = blobList.length
  const url = URL.createObjectURL(blobList[time % length])
  map.addSource(dataID, {
    type: 'image',
    url,
    coordinates: [
      [extent[0], extent[3]],
      [extent[1], extent[3]],
      [extent[1], extent[2]],
      [extent[0], extent[2]],
    ],
  })
  map.addLayer({
    id: dataID,
    type: 'raster',
    source: dataID,
  })
  const intervalFunc = setInterval(() => {
    const url = URL.createObjectURL(blobList[time % length])
    ;(map.getSource(dataID) as ImageSource).updateImage({ url })
    time++
  }, 200)

  return intervalFunc
}

export const removeMapLayer = (map: mapboxgl.Map, dataID: string) => {
  if (map.getLayer(dataID)) map.removeLayer(dataID)
}

export const removeMapSource = (map: mapboxgl.Map, dataID: string) => {
  if (map.getSource(dataID)) map.removeSource(dataID)
}

export const convertToMercator = (lonLat: Position2) => {
  const D2R = Math.PI / 180
  const A = 6378137.0
  const MAXEXTENT = 20037508.342789244

  const adjusted =
    Math.abs(lonLat[0]) <= 180
      ? lonLat[0]
      : lonLat[0] - Math.sign(lonLat[0]) * 360
  const xy: Position2 = [
    A * adjusted * D2R,
    A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * lonLat[1] * D2R)),
  ]

  if (xy[0] > MAXEXTENT) xy[0] = MAXEXTENT
  if (xy[0] < -MAXEXTENT) xy[0] = -MAXEXTENT
  if (xy[1] > MAXEXTENT) xy[1] = MAXEXTENT
  if (xy[1] < -MAXEXTENT) xy[1] = -MAXEXTENT

  return xy
}

export function convertToWgs84(xy: Position2) {
  const R2D = 180 / Math.PI
  const A = 6378137.0

  return [
    (xy[0] * R2D) / A,
    (Math.PI * 0.5 - 2.0 * Math.atan(Math.exp(-xy[1] / A))) * R2D,
  ] as Position2
}
