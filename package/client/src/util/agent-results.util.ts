import type { Map as MapboxMap } from 'mapbox-gl'
import type { GeoJSON } from 'geojson'
import { toWgs84 } from '@turf/projection'

import {
  addGeoJSONToMap,
  addImageToMapWithUrl,
  convertToWgs84,
  type MapStyle,
  removeMapLayer,
  removeMapSource,
} from './mapbox.util'

export type ResultsSummary = {
  version: number
  createdAt: string
  geometryType: 'point' | 'line' | 'polygon'
  target: string
  tripleCount: number
  bbox: [number, number, number, number] | null
  center: [number, number] | null
}

export type ResultsGeoJson = {
  resultGeoJSON: GeoJSON | null
  regionGeoJSON: GeoJSON | null
}

export type TripleResult = {
  coord: [number, number] | [number, number][] | null
  regionGeoJSON: GeoJSON | null
  pdfGridPath: string | null
  pdfGridBbox: [number, number, number, number] | null
}

export type RenderCleanupItem = { id: string; objectUrl?: string }

async function ensureMapLoaded(map: MapboxMap): Promise<void> {
  if (map.loaded()) return
  await new Promise<void>((resolve) => map.once('load', () => resolve()))
}

function bbox3857ToExtentWgs84(
  bbox: [number, number, number, number],
): number[] {
  const [minX, minY, maxX, maxY] = bbox
  const [minLng, minLat] = convertToWgs84([minX, minY])
  const [maxLng, maxLat] = convertToWgs84([maxX, maxY])
  return [minLng, minLat, maxLng, maxLat]
}

function computeGeoJsonBbox3857(
  geojson: GeoJSON,
): [number, number, number, number] | null {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null

  const visitPosition = (pos: unknown) => {
    if (!Array.isArray(pos) || pos.length < 2) return
    const x = Number(pos[0])
    const y = Number(pos[1])
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  const visitCoords = (coords: unknown) => {
    if (!coords) return
    if (Array.isArray(coords) && typeof coords[0] === 'number') {
      visitPosition(coords)
      return
    }
    if (Array.isArray(coords)) {
      for (const c of coords) visitCoords(c)
    }
  }

  const visitGeometry = (g: unknown) => {
    if (!isRecord(g)) return
    if (g.type === 'GeometryCollection' && Array.isArray(g.geometries)) {
      for (const gg of g.geometries) visitGeometry(gg)
      return
    }
    if ('coordinates' in g) visitCoords(g.coordinates)
  }

  const visit = (obj: unknown) => {
    if (!isRecord(obj)) return
    if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
      for (const f of obj.features) visit(f)
      return
    }
    if (obj.type === 'Feature') {
      visitGeometry(obj.geometry)
      return
    }
    visitGeometry(obj)
  }

  visit(geojson)

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  )
    return null
  return [minX, minY, maxX, maxY]
}

export async function fetchResultsSummary(
  resultsId: string,
): Promise<ResultsSummary> {
  const res = await fetch(
    `/api/results/${encodeURIComponent(resultsId)}/summary`,
  )
  if (!res.ok) throw new Error(`failed_to_fetch_summary: ${res.status}`)
  return (await res.json()) as ResultsSummary
}

export async function fetchResultsGeojson(
  resultsId: string,
): Promise<ResultsGeoJson> {
  const res = await fetch(
    `/api/results/${encodeURIComponent(resultsId)}/geojson`,
  )
  if (!res.ok) throw new Error(`failed_to_fetch_geojson: ${res.status}`)
  return (await res.json()) as ResultsGeoJson
}

export async function fetchResultsTriples(
  resultsId: string,
): Promise<TripleResult[]> {
  const res = await fetch(
    `/api/results/${encodeURIComponent(resultsId)}/triples`,
  )
  if (!res.ok) throw new Error(`failed_to_fetch_triples: ${res.status}`)
  return (await res.json()) as TripleResult[]
}

async function fetchPngBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`failed_to_fetch_png: ${res.status}`)
  return await res.blob()
}

export async function renderResultsToMap(params: {
  map: MapboxMap
  resultsId: string
  previousCleanup: RenderCleanupItem[]
}): Promise<RenderCleanupItem[]> {
  const { map, resultsId, previousCleanup } = params

  await ensureMapLoaded(map)

  for (const item of previousCleanup) {
    removeMapLayer(map, item.id)
    removeMapSource(map, item.id)
    if (item.objectUrl) URL.revokeObjectURL(item.objectUrl)
  }

  const cleanup: RenderCleanupItem[] = []

  const [summary, geojson, triples] = await Promise.all([
    fetchResultsSummary(resultsId),
    fetchResultsGeojson(resultsId),
    fetchResultsTriples(resultsId),
  ])

  const fitBbox =
    (geojson.regionGeoJSON
      ? computeGeoJsonBbox3857(geojson.regionGeoJSON)
      : null) ??
    (geojson.resultGeoJSON
      ? computeGeoJsonBbox3857(geojson.resultGeoJSON)
      : null) ??
    summary.bbox

  if (fitBbox) {
    const extent = bbox3857ToExtentWgs84(fitBbox)
    map.fitBounds(
      [
        [extent[0], extent[1]],
        [extent[2], extent[3]],
      ],
      { padding: 40, maxZoom: 16 },
    )
  }

  const prefix = `agent-${resultsId}`

  if (summary.geometryType === 'point') {
    const regionPng = await fetchPngBlob(
      `/api/results/${encodeURIComponent(resultsId)}/grids/region.png`,
    )
    const regionGeo = (
      geojson.regionGeoJSON ? toWgs84(geojson.regionGeoJSON) : null
    ) as GeoJSON | null
    const resultGeo = (
      geojson.resultGeoJSON ? toWgs84(geojson.resultGeoJSON) : null
    ) as GeoJSON | null

    const regionBbox =
      (geojson.regionGeoJSON
        ? computeGeoJsonBbox3857(geojson.regionGeoJSON)
        : null) ?? summary.bbox
    const regionExtent = regionBbox ? bbox3857ToExtentWgs84(regionBbox) : null

    if (regionExtent) {
      const id = `${prefix}-region-heatmap`
      const objectUrl = addImageToMapWithUrl(
        map,
        id,
        regionPng,
        regionExtent,
        0.6,
      )
      cleanup.push({ id, objectUrl })
    }

    if (regionGeo) {
      const id = `${prefix}-region`
      addGeoJSONToMap(map, id, regionGeo as GeoJSON, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': '#4ade80',
        'fill-opacity': 0.35,
      })
      cleanup.push({ id })
    }

    if (resultGeo) {
      const id = `${prefix}-result`
      addGeoJSONToMap(map, id, resultGeo as GeoJSON, 'circle', {
        'circle-color': '#dc2626',
        'circle-radius': 6,
      })
      cleanup.push({ id })
    }

    return cleanup
  }

  // line / polygon：渲染所有 triple 的热力图
  for (let index = 0; index < triples.length; index++) {
    const t = triples[index]
    if (!t?.pdfGridBbox) continue
    const extent = bbox3857ToExtentWgs84(t.pdfGridBbox)
    const blob = await fetchPngBlob(
      `/api/results/${encodeURIComponent(resultsId)}/grids/${index}.png`,
    )

    const id = `${prefix}-triple-${index}-heatmap`
    const objectUrl = addImageToMapWithUrl(map, id, blob, extent, 0.6)
    cleanup.push({ id, objectUrl })
  }

  const resultGeo = (
    geojson.resultGeoJSON ? toWgs84(geojson.resultGeoJSON) : null
  ) as GeoJSON | null

  if (resultGeo) {
    const id = `${prefix}-result`
    const style: MapStyle =
      summary.geometryType === 'line'
        ? { 'line-color': '#dc2626', 'line-width': 3 }
        : {
            'fill-outline-color': '#dc2626',
            'fill-color': 'rgba(220, 38, 38, 0.25)',
          }
    addGeoJSONToMap(
      map,
      id,
      resultGeo as GeoJSON,
      summary.geometryType === 'line' ? 'line' : 'fill',
      style,
    )
    cleanup.push({ id })
  }

  return cleanup
}
