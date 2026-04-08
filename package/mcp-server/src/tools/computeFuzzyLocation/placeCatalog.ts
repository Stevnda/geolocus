import { readFile } from 'node:fs/promises'

import type { McpServerConfig } from '../../config.js'
import { resolveFromRepo } from '../../config.js'
import { placeCatalogSchema } from './schemas.js'

export type PlaceCatalog = ReturnType<typeof placeCatalogSchema.parse>

export async function loadPlaceCatalogFromConfig(
  cfg: McpServerConfig,
): Promise<PlaceCatalog | null> {
  const file = cfg.placeCatalogFile
  if (!file) return null

  const raw = await readFile(resolveFromRepo(file), 'utf8')
  const parsed = JSON.parse(raw)
  return placeCatalogSchema.parse(parsed)
}
