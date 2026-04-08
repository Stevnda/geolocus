import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { computeFuzzyLocation } from './computeFuzzyLocation.js'
import { computeFuzzyLocationInputSchema } from './schemas.js'

export function registerComputeFuzzyLocationTool(server: McpServer) {
  server.tool(
    'compute_fuzzy_location',
    'Compute fuzzy point/line/polygon via @geolocus/core, write full render JSON to file and return { summary, filePath }.',
    computeFuzzyLocationInputSchema,
    async ({ geometryType, triples, contextOverrides }) => {
      process.stderr.write(
        `[mcp] compute_fuzzy_location received: ${JSON.stringify({
          geometryType,
          triples,
          contextOverrides,
        })}\n`,
      )

      const result = await computeFuzzyLocation({
        geometryType,
        triples,
        context: contextOverrides ?? undefined,
      })

      if (result.ok) {
        process.stderr.write(
          `[mcp] compute_fuzzy_location summary: ${JSON.stringify(result.summary)}\n`,
        )
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
        isError: !result.ok,
      }
    },
  )
}
