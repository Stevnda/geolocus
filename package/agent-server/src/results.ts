import path from 'node:path'
import { readFile, realpath } from 'node:fs/promises'
import { resolveFromRepo } from './config.js'

export type ResultsMeta = {
  version: number
  createdAt: string
  geometryType: 'point' | 'line' | 'polygon'
  target: string
  triples: unknown[]
  bbox: [number, number, number, number] | null
  center: [number, number] | null
  resultGeoJSON: unknown | null
  regionGeoJSON: unknown | null
  regionPdfGridPath: string | null
  regionPdfGridBbox: [number, number, number, number] | null
  tripleResults: Array<{
    coord: [number, number] | [number, number][] | null
    regionGeoJSON: unknown | null
    pdfGridPath: string | null
    pdfGridBbox: [number, number, number, number] | null
  }>
}

export function toSafeResultsId(filePath: string): string {
  // Persist the "id" as filename only; avoids leaking absolute paths to clients.
  return path.basename(filePath)
}

function isSafeId(id: string): boolean {
  return (
    Boolean(id) && !id.includes('..') && !id.includes('/') && !id.includes('\\')
  )
}

export async function resolveResultsDir(params: {
  allowedDir: string
  id: string
}): Promise<{ allowedDirReal: string; dirReal: string; dirPath: string }> {
  const id = params.id
  if (!isSafeId(id)) throw new Error('invalid_result_id')

  const allowedDirAbs = resolveFromRepo(params.allowedDir)
  const dirPath = path.join(allowedDirAbs, id)

  // realpath 能解析符号链接；配合 startsWith 校验，防止“链接跳出 allowDir”。
  const [allowedDirReal, dirReal] = await Promise.all([
    realpath(allowedDirAbs),
    realpath(dirPath),
  ])

  const normalizedAllowed = allowedDirReal.endsWith(path.sep)
    ? allowedDirReal
    : allowedDirReal + path.sep

  if (!dirReal.startsWith(normalizedAllowed)) {
    throw new Error('result_id_outside_allowed_dir')
  }

  return { allowedDirReal, dirReal, dirPath }
}

export async function readMetaJson(resultsDir: string): Promise<ResultsMeta> {
  const metaPath = path.join(resultsDir, 'meta.json')
  const raw = await readFile(metaPath, 'utf8')
  return JSON.parse(raw) as ResultsMeta
}

function isSafeRelativePath(relPath: string): boolean {
  if (!relPath) return false
  if (path.isAbsolute(relPath)) return false
  const normalized = relPath.replace(/\\/g, '/')
  if (normalized.includes('..')) return false
  return true
}

export async function readPngFile(params: {
  resultsDir: string
  relPath: string
}): Promise<Buffer> {
  if (!isSafeRelativePath(params.relPath)) throw new Error('invalid_png_path')
  const pngPath = path.join(params.resultsDir, params.relPath)
  const [dirReal, pngReal] = await Promise.all([
    realpath(params.resultsDir),
    realpath(pngPath),
  ])
  const normalizedDir = dirReal.endsWith(path.sep)
    ? dirReal
    : dirReal + path.sep
  if (!pngReal.startsWith(normalizedDir))
    throw new Error('png_outside_results_dir')
  if (!pngReal.toLowerCase().endsWith('.png')) throw new Error('not_png')
  return readFile(pngReal)
}
