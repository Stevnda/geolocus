import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { type Geolocus, type RegionResult } from '@geolocus/core'
import type { GeoJSON } from 'geojson'

import { loadConfig } from '../../config.js'
import {
  collectUnresolvedOriginNames,
  createDefaultGeolocusContext,
  type ComputeContextOverrides,
} from './context.js'
import { toCoreTriple } from './convert.js'
import { loadPlaceCatalogFromConfig } from './placeCatalog.js'
import type { ToolUserGeolocusTriple } from './schemas.js'

export type GeometryType = 'point' | 'line' | 'polygon'

export type ComputeFuzzyLocationSummary = {
  geometryType: GeometryType
  target: string
  tripleCount: number
  unresolvedOriginNames: string[]
  unresolvedOriginNamesTruncated: boolean
  computed: boolean
  resultNull: boolean
  regionNull: boolean
  gridNull: boolean
  bbox: [number, number, number, number] | null
  center: [number, number] | null
  warnings: string[]
}

export type ComputeFuzzyLocationOk = {
  ok: true
  summary: ComputeFuzzyLocationSummary
  filePath: string
}

export type ComputeFuzzyLocationErr = {
  ok: false
  error: string
  details?: { [key: string]: string | boolean | string[] }
}

export type ComputeFuzzyLocationResult =
  | ComputeFuzzyLocationOk
  | ComputeFuzzyLocationErr

type PdfGridFile = {
  type: 'gdf' | 'sdf' | 'spread' | null
  grid: number[][] | null
  bbox: [number, number, number, number] | null
  weight: number
}

type TripleResultFile = {
  coord: [number, number] | [number, number][] | null
  regionGeoJSON: GeoJSON | null
  pdfGrid: PdfGridFile | null
}

type RenderFile = {
  resultGeoJSON: GeoJSON | null
  regionGeoJSON: GeoJSON | null
  regionPdfGrid: number[][] | null
  tripleResults: TripleResultFile[]
}

function sanitizeForFile(
  geolocusContext: Geolocus,
  regionResult: RegionResult,
): RenderFile {
  const resultObject = regionResult.result
  const regionObject = regionResult.region

  const resultGeoJSON = resultObject
    ? geolocusContext.toGeoJSON(resultObject)
    : null
  const regionGeoJSON = regionObject
    ? geolocusContext.toGeoJSON(regionObject)
    : null

  const tripleResults = regionResult.geoTripleResultList.map((r) => ({
    coord: (r.coord ?? null) as [number, number] | [number, number][] | null,
    regionGeoJSON: r.region ? geolocusContext.toGeoJSON(r.region) : null,
    pdfGrid: r.pdfGrid
      ? {
          type: r.pdfGrid.type,
          grid: r.pdfGrid.grid ?? null,
          bbox: (r.pdfGrid.bbox ?? null) as
            | [number, number, number, number]
            | null,
          weight: r.pdfGrid.weight,
        }
      : null,
  }))

  return {
    resultGeoJSON,
    regionGeoJSON,
    regionPdfGrid: regionResult.regionPdfGrid ?? null,
    tripleResults,
  }
}

function summarize(
  geometryType: GeometryType,
  target: string,
  tripleCount: number,
  unresolvedOriginNames: string[],
  computed: boolean,
  regionResult: RegionResult | null,
): ComputeFuzzyLocationSummary {
  const warnings: string[] = []
  if (!computed) warnings.push('not_computed')

  const resultObject = regionResult?.result ?? null
  const regionObject = regionResult?.region ?? null
  const bbox = (resultObject?.getGeometry().getBBox() ??
    regionObject?.getGeometry().getBBox() ??
    null) as [number, number, number, number] | null
  const center = (resultObject?.getGeometry().getCenter() ??
    regionObject?.getGeometry().getCenter() ??
    null) as [number, number] | null

  const unresolvedCap = 20
  const truncated = unresolvedOriginNames.length > unresolvedCap
  const unresolvedList = truncated
    ? unresolvedOriginNames.slice(0, unresolvedCap)
    : unresolvedOriginNames

  return {
    geometryType,
    target,
    tripleCount,
    unresolvedOriginNames: unresolvedList,
    unresolvedOriginNamesTruncated: truncated,
    computed,
    resultNull: regionResult?.result == null,
    regionNull: regionResult?.region == null,
    gridNull: regionResult?.regionPdfGrid == null,
    bbox,
    center,
    warnings,
  }
}

function getTargets(triples: ToolUserGeolocusTriple[]): string[] {
  return Array.from(new Set(triples.map((t) => t.target)))
}

function resolveOutputDir(outputDir: string): string {
  if (path.isAbsolute(outputDir)) return outputDir
  return path.resolve(process.cwd(), outputDir)
}

async function writeResultFile(params: {
  outputDir: string
  geometryType: GeometryType
  target: string
  triples: ToolUserGeolocusTriple[]
  render: RenderFile
}): Promise<string> {
  const absDir = resolveOutputDir(params.outputDir)
  await mkdir(absDir, { recursive: true })

  const safeTarget = params.target.replace(/[^\p{L}\p{N}_-]+/gu, '_')
  const filename = `${Date.now()}_${params.geometryType}_${safeTarget}.json`
  const filePath = path.join(absDir, filename)

  const payload = {
    version: 1,
    createdAt: new Date().toISOString(),
    geometryType: params.geometryType,
    target: params.target,
    triples: params.triples,
    render: params.render,
  }

  await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')
  return filePath
}

function computeRegion(
  geolocusContext: Geolocus,
  geometryType: GeometryType,
  target: string,
): RegionResult | null {
  if (geometryType === 'point')
    return geolocusContext.computeFuzzyPointObject(target)
  if (geometryType === 'line')
    return geolocusContext.computeFuzzyLineObject(target)
  return geolocusContext.computeFuzzyPolygonObject(target)
}

export async function computeFuzzyLocation(params: {
  geometryType: GeometryType
  triples: ToolUserGeolocusTriple[]
  context?: ComputeContextOverrides
}): Promise<ComputeFuzzyLocationResult> {
  const { geometryType, triples, context } = params
  const cfg = await loadConfig()

  const targets = getTargets(triples)
  if (targets.length !== 1) {
    return {
      ok: false,
      error: 'multiple_targets',
      details: { targets },
    }
  }
  const target = targets[0]
  if (!target) return { ok: false, error: 'missing_target' }

  let configPlaceCatalog = null as Awaited<
    ReturnType<typeof loadPlaceCatalogFromConfig>
  >
  try {
    configPlaceCatalog = await loadPlaceCatalogFromConfig(cfg)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      error: 'invalid_place_catalog',
      details: { message },
    }
  }

  const placeCatalog = {
    ...(configPlaceCatalog ?? {}),
    ...(context?.placeCatalog ?? {}),
  }

  const unresolvedOriginNames = collectUnresolvedOriginNames(
    triples,
    placeCatalog,
  )
  if (unresolvedOriginNames.length > 0) {
    const cap = 20
    return {
      ok: false,
      error: 'unresolved_origins',
      details: {
        unresolvedOriginNames: unresolvedOriginNames.slice(0, cap),
        unresolvedOriginNamesTruncated: unresolvedOriginNames.length > cap,
      },
    }
  }

  const geolocusContext = createDefaultGeolocusContext({ placeCatalog })

  try {
    geolocusContext.defineRelation(triples.map(toCoreTriple), geometryType)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `define_relation_failed: ${message}` }
  }

  let regionResult: RegionResult | null = null
  try {
    regionResult = computeRegion(geolocusContext, geometryType, target)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `compute_failed: ${message}` }
  }

  const render: RenderFile = regionResult
    ? sanitizeForFile(geolocusContext, regionResult)
    : {
        resultGeoJSON: null,
        regionGeoJSON: null,
        regionPdfGrid: null,
        tripleResults: [],
      }

  const filePath = await writeResultFile({
    outputDir: cfg.outputDir,
    geometryType,
    target,
    triples,
    render,
  })

  const summary = summarize(
    geometryType,
    target,
    triples.length,
    unresolvedOriginNames,
    regionResult != null,
    regionResult,
  )

  return { ok: true, summary, filePath }
}
