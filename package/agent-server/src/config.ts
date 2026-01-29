import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const configSchema = z.object({
  http: z
    .object({
      host: z.string().min(1).default('127.0.0.1'),
      port: z.number().int().positive().default(8080),
    })
    .default({ host: '127.0.0.1', port: 8080 }),

  deepseek: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().min(1).default('https://api.deepseek.com'),
    model: z.string().min(1).default('deepseek-chat'),
    timeoutMs: z.number().int().positive().default(60000),
  }),

  mcp: z.object({
    // MCP Server 的 HTTP 入口（本项目为 http://127.0.0.1:3000/mcp）
    baseUrl: z.string().min(1),
  }),

  results: z.object({
    // Directory allowlist for reading MCP output files. Can be relative to repo root.
    // 为了避免任意文件读取漏洞：只允许读取该目录下（以及其子目录下）的结果文件。
    allowedDir: z.string().min(1),
  }),
})

export type AgentServerConfig = z.infer<typeof configSchema>

export function parseConfig(json: unknown): AgentServerConfig {
  return configSchema.parse(json)
}

let cachedConfig: AgentServerConfig | null = null
let cachedRepoRoot: string | null = null

export function getRepoRoot(): string {
  if (cachedRepoRoot) return cachedRepoRoot
  const configPath = fileURLToPath(new URL('../config.json', import.meta.url))
  // 约定：agent-server 的 config.json 位于 package/agent-server/ 下
  cachedRepoRoot = path.resolve(path.dirname(configPath), '..', '..')
  return cachedRepoRoot
}

export function resolveFromRepo(p: string): string {
  if (path.isAbsolute(p)) return p
  return path.resolve(getRepoRoot(), p)
}

export async function loadConfig(): Promise<AgentServerConfig> {
  if (cachedConfig) return cachedConfig

  const configPath = fileURLToPath(new URL('../config.json', import.meta.url))
  const raw = await readFile(configPath, 'utf8').catch((err) => {
    const message =
      err instanceof Error ? err.message : 'failed to read config.json'
    throw new Error(
      `Missing or unreadable config at package/agent-server/config.json (${message}). Copy package/agent-server/config.example.json to config.json and fill in values.`,
    )
  })

  const parsedJson = JSON.parse(raw)
  cachedConfig = configSchema.parse(parsedJson)
  return cachedConfig
}
