import { z } from 'zod'

const addInputSchema = z.object({
  a: z.number(),
  b: z.number(),
})

async function main() {
  const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js')
  const { StdioServerTransport } = await import(
    '@modelcontextprotocol/sdk/server/stdio.js'
  )

  const server = new McpServer({
    name: 'geolocus-mcp-server',
    version: '0.0.1',
  })

  server.registerTool(
    'add',
    {
      description: 'Return a + b.',
      inputSchema: addInputSchema,
    },
    async (args: unknown) => {
      const { a, b } = addInputSchema.parse(args)
      return {
        content: [{ type: 'text' as const, text: String(a + b) }],
      }
    },
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  const message =
    err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  process.stderr.write(message + '\n')
  process.exitCode = 1
})
