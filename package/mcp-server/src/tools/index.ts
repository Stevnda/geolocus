import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerParseGeoTextTool } from './parseGeoText/register.js'

export function registerTools(server: McpServer) {
  registerParseGeoTextTool(server)
}
