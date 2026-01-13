import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerComputeFuzzyLocationTool } from './computeFuzzyLocation/register.js'
import { registerParseGeoTextTool } from './parseGeoText/register.js'

export function registerTools(server: McpServer) {
  registerParseGeoTextTool(server)
  registerComputeFuzzyLocationTool(server)
}
