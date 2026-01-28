import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const configSchema = z.object({
  deepseek: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().min(1).default('https://api.deepseek.com'),
    model: z.string().min(1).default('deepseek-chat'),
    timeoutMs: z.number().int().positive().default(60000),
  }),
  outputDir: z.string().min(1).default('package/mcp-server/temp-files'),
  placeCatalogFile: z.string().min(1).optional(),
  http: z
    .object({
      host: z.string().min(1).default('127.0.0.1'),
      port: z.number().int().positive().default(3000),
    })
    .default({ host: '127.0.0.1', port: 3000 }),
})

export type McpServerConfig = z.infer<typeof configSchema>

let cachedConfig: McpServerConfig | null = null
let cachedRepoRoot: string | null = null

export function getRepoRoot(): string {
  if (cachedRepoRoot) return cachedRepoRoot
  const configPath = fileURLToPath(new URL('../config.json', import.meta.url))
  cachedRepoRoot = path.resolve(path.dirname(configPath), '..', '..')
  return cachedRepoRoot
}

export function resolveFromRepo(filePath: string): string {
  if (path.isAbsolute(filePath)) return filePath
  return path.resolve(getRepoRoot(), filePath)
}

export async function loadConfig(): Promise<McpServerConfig> {
  if (cachedConfig) return cachedConfig

  const configPath = fileURLToPath(new URL('../config.json', import.meta.url))
  const raw = await readFile(configPath, 'utf8').catch((err) => {
    const message =
      err instanceof Error ? err.message : 'failed to read config.json'
    throw new Error(
      `Missing or unreadable config at package/mcp-server/config.json (${message}). Copy package/mcp-server/config.example.json to config.json and fill in values.`,
    )
  })

  const parsedJson = JSON.parse(raw)
  cachedConfig = configSchema.parse(parsedJson)
  return cachedConfig
}
