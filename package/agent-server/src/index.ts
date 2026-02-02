import { createDeepSeek } from '@ai-sdk/deepseek'

import { loadConfig } from './config.js'
import { createGeolocusMcpClient } from './mcp.js'
import { createApp } from './app.js'
import { loadSystemPrompt } from './prompt.js'

async function main() {
  // 1) 加载配置与 system prompt（都来自本地文件）
  const cfg = await loadConfig()
  const system = await loadSystemPrompt()

  // 2) 创建 DeepSeek provider 实例（不走环境变量，全部来自 config.json）
  const deepseek = createDeepSeek({
    apiKey: cfg.deepseek.apiKey,
    baseURL: cfg.deepseek.baseUrl,
  })

  // 3) 连接 MCP Server，并将其工具转换为 AI SDK tools（由 @ai-sdk/mcp 自动完成）
  const mcpClient = await createGeolocusMcpClient({ url: cfg.mcp.baseUrl })
  // Discover tools from MCP server (names + schemas) and expose them to the model.
  const mcpTools = await mcpClient.tools()

  const app = createApp({
    cfg,
    chat: {
      system,
      model: deepseek,
      mcpTools: mcpTools as Record<string, unknown>,
    },
  })

  const httpServer = app.listen(cfg.http.port, cfg.http.host, () => {
    process.stdout.write(
      `agent-server listening on http://${cfg.http.host}:${cfg.http.port}\n`,
    )
  })

  process.on('SIGINT', async () => {
    // Ctrl+C 优雅退出：关闭 HTTP server + 关闭 MCP client（释放连接/资源）
    httpServer.close()
    await mcpClient.close().catch((err) => {
      process.stderr.write(
        `[agent-server] failed to close mcp client: ${String(err)}\n`,
      )
    })
    process.exit(0)
  })
}

main().catch((err) => {
  const message =
    err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  process.stderr.write(message + '\n')
  process.exitCode = 1
})
