import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { registerTools } from './tools/index.js'

const addInputShape = {
  a: z.number(),
  b: z.number(),
}

export function createServer() {
  const server = new McpServer({
    name: 'geolocus-mcp-server',
    version: '0.0.1',
  })

  server.tool('add', 'Return a + b.', addInputShape, async ({ a, b }) => ({
    content: [{ type: 'text', text: String(a + b) }],
  }))

  registerTools(server)
  return server
}
