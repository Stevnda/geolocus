import { createDeepSeek } from '@ai-sdk/deepseek'
import { createMCPClient } from '@ai-sdk/mcp'
import { generateText } from 'ai'

import { loadConfig } from './config.js'

async function main() {
  // 这是“真实连通性”检查：会真实调用 DeepSeek + 连接 MCP Server。
  // 用于验证：config.json 是否填写正确、网络/端口是否可用、MCP tools 是否可发现。
  const cfg = await loadConfig()

  if (!cfg.deepseek.apiKey || cfg.deepseek.apiKey === 'YOUR_DEEPSEEK_API_KEY') {
    throw new Error(
      'deepseek.apiKey is missing. Fill package/agent-server/config.json and rerun.',
    )
  }

  const deepseek = createDeepSeek({
    apiKey: cfg.deepseek.apiKey,
    baseURL: cfg.deepseek.baseUrl,
  })

  const textRes = await generateText({
    model: deepseek(cfg.deepseek.model),
    prompt: '回复 "pong"。',
    maxOutputTokens: 8,
  })

  process.stdout.write(
    `[smoke] deepseek response: ${JSON.stringify(textRes.text)}\n`,
  )

  const mcp = await createMCPClient({
    transport: { type: 'http', url: cfg.mcp.baseUrl },
    name: 'geolocus-agent-server-smoke',
  })
  try {
    const tools = await mcp.tools()
    // tools 是 AI SDK tool set：key 即 toolName
    process.stdout.write(
      `[smoke] mcp tools: ${Object.keys(tools).join(', ')}\n`,
    )
  } finally {
    await mcp.close()
  }
}

main().catch((err) => {
  const message =
    err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  process.stderr.write(message + '\n')
  process.exitCode = 1
})
