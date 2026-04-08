import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { parseGeoText } from './parseGeoText.js'

const inputShape = {
  text: z.string().min(1),
}

export function registerParseGeoTextTool(server: McpServer) {
  server.tool(
    'parse_geo_text',
    'Parse Chinese descriptive geo text into UserGeolocusTriple[]. Input: { "text": "..." }',
    inputShape,
    async ({ text }: { text: string }) => {
      const result = await parseGeoText(text)
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
        isError: !result.ok,
      }
    },
  )
}
