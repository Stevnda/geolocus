import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { Request, Response } from 'express'
import { loadConfig } from './config.js'
import { createServer } from './server.js'

async function startStdio() {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

async function startHttp() {
  const cfg = await loadConfig()
  const host = cfg.http.host
  const port = cfg.http.port

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
