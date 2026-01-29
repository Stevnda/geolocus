import express, { type Request, type Response } from 'express'
import { z } from 'zod'

import { createDeepSeek } from '@ai-sdk/deepseek'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai'

import { loadConfig } from './config.js'
import { createGeolocusMcpClient } from './mcp.js'
import { resolveResultsFile, toSafeResultsId } from './results.js'
import { readFile } from 'node:fs/promises'
import { loadSystemPrompt } from './prompt.js'

const chatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
})

function jsonBody(limit: string) {
  // Express 默认 JSON body parser。这里显式限制 body 大小，避免无意中吃超大 payload。
  return express.json({ limit })
}

function badRequest(res: Response, error: string) {
  // 统一 400 错误返回结构，方便前端/调试脚本处理。
  return res.status(400).json({ error })
}

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

  const app = express()
  app.use(jsonBody('2mb'))

  // 用于探活/部署健康检查
  app.get('/healthz', (_req, res) => res.json({ ok: true }))

  app.post('/api/chat', async (req: Request, res: Response) => {
    // 注意：这里的输入协议是 AI SDK UIMessage（useChat 的 messages）。
    // 后续如果你想对接自定义前端协议，可以在这里做一层转换。
    let body: unknown
    try {
      body = req.body
    } catch {
      return badRequest(res, 'invalid_json')
    }

    const parsed = chatRequestSchema.safeParse(body)
    if (!parsed.success) return badRequest(res, 'bad_request')

    const result = streamText({
      model: deepseek(cfg.deepseek.model),
      system,
      messages: await convertToModelMessages(parsed.data.messages),
      // 允许模型多步调用工具（ReAct 风格）。步数上限越大，越可能“绕远路”，这里先保守。
      stopWhen: stepCountIs(8),
      // AI SDK data stream includes tool-call/tool-result events; we just pipe it through.
      tools: {
        ...mcpTools,
        // Some MCP tools return an absolute filePath; expose only a filename-only id to clients.
        to_results_id: {
          description:
            'Convert an MCP compute_fuzzy_location filePath into resultsId (basename).',
          inputSchema: z.object({ filePath: z.string().min(1) }),
          execute: async ({ filePath }: { filePath: string }) =>
            toSafeResultsId(filePath),
        },
      },
    })

    // 直接透传 AI SDK 官方 data stream（SSE）。其中包含：
    // - 文本 delta
    // - tool-call / tool-result 事件
    result.pipeUIMessageStreamToResponse(res)
  })

  app.get('/api/results/:id', async (req: Request, res: Response) => {
    const id = String(req.params.id || '')
    try {
      // Strong allowlist: only allow reading files under results.allowedDir.
      const resolved = await resolveResultsFile({
        allowedDir: cfg.results.allowedDir,
        id,
      })
      const json = await readFile(resolved.filePath, 'utf8')
      res.setHeader('content-type', 'application/json; charset=utf-8')
      return res.status(200).send(json)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (
        message === 'invalid_result_id' ||
        message === 'result_id_outside_allowed_dir'
      ) {
        return badRequest(res, message)
      }
      return res.status(404).json({ error: 'not_found' })
    }
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
