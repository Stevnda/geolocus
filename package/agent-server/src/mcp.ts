import { createMCPClient, type MCPClient } from '@ai-sdk/mcp'
import { z } from 'zod'

export type McpTools = Awaited<ReturnType<MCPClient['tools']>>

export async function createGeolocusMcpClient(params: {
  url: string
}): Promise<MCPClient> {
  // HTTP transport recommended for production. Our MCP server exposes `/mcp`.
  return createMCPClient({
    transport: { type: 'http', url: params.url },
    name: 'geolocus-agent-server',
  })
}

// 下面这些 schema 用于“约束/记录”我们关心的 MCP tool 输出形状。
// 目的：
// - 便于测试（不用真的调用 MCP 就能校验形状）
// - 后续如果 MCP 输出结构变化，能更快发现并定位
export const computeFuzzyLocationSummarySchema = z.object({
  geometryType: z.enum(['point', 'line', 'polygon']),
  target: z.string(),
  tripleCount: z.number(),
  unresolvedOriginNames: z.array(z.string()),
  unresolvedOriginNamesTruncated: z.boolean(),
  computed: z.boolean(),
  resultNull: z.boolean(),
  regionNull: z.boolean(),
  gridNull: z.boolean(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).nullable(),
  center: z.tuple([z.number(), z.number()]).nullable(),
  warnings: z.array(z.string()),
})

export const computeFuzzyLocationOkSchema = z.object({
  ok: z.literal(true),
  summary: computeFuzzyLocationSummarySchema,
  filePath: z.string(),
})

export const computeFuzzyLocationErrSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  details: z
    .record(z.string(), z.union([z.string(), z.boolean(), z.array(z.string())]))
    .optional(),
})

export const computeFuzzyLocationResultSchema = z.union([
  computeFuzzyLocationOkSchema,
  computeFuzzyLocationErrSchema,
])
