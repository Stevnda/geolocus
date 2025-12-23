import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { Request, Response } from 'express'
import { z } from 'zod'

const addInputShape = {
  a: z.number(),
  b: z.number(),
}

function createServer() {
  const server = new McpServer({
    name: 'geolocus-mcp-server',
    version: '0.0.1',
  })

  server.tool(
    'add',
    'Return a + b.',
    addInputShape,
    async ({ a, b }: { a: number; b: number }) => ({
      content: [{ type: 'text', text: String(a + b) }],
    }),
  )

  return server
}

async function startStdio() {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

async function startHttp() {
  const host = process.env.MCP_HTTP_HOST || '127.0.0.1'
  const port = Number(process.env.MCP_HTTP_PORT || '3000')

  const server = createServer()
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  await server.connect(transport)

  const app = createMcpExpressApp({ host })

  app.post('/mcp', async (req: Request, res: Response) => {
    await transport.handleRequest(req, res, req.body)
  })

  app.get('/mcp', async (req: Request, res: Response) => {
    await transport.handleRequest(req, res)
  })

  app.delete('/mcp', async (req: Request, res: Response) => {
    await transport.handleRequest(req, res)
  })

  const httpServer = app.listen(port, host, () => {
    process.stdout.write(
      `MCP Streamable HTTP listening on http://${host}:${port}/mcp\n`,
    )
  })

  process.on('SIGINT', async () => {
    httpServer.close()
    await transport.close()
    await server.close()
    process.exit(0)
  })
}

async function main() {
  const useHttp = process.argv.includes('--http')
  if (useHttp) return startHttp()
  return startStdio()
}

main().catch((err) => {
  const message =
    err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  process.stderr.write(message + '\n')
  process.exitCode = 1
})
