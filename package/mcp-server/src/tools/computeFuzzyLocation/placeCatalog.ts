import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { McpServerConfig } from '../../config.js'
import { placeCatalogSchema } from './schemas.js'

export type PlaceCatalog = ReturnType<typeof placeCatalogSchema.parse>

function resolveConfigPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)
}

export async function loadPlaceCatalogFromConfig(
  cfg: McpServerConfig,
): Promise<PlaceCatalog | null> {
  const file = cfg.placeCatalogFile
  if (!file) return null

  const raw = await readFile(resolveConfigPath(file), 'utf8')
  const parsed = JSON.parse(raw)
  return placeCatalogSchema.parse(parsed)
}
