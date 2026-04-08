## Context

项目已有 MCP Server（`package/mcp-server`），对外暴露两个工具：

- `parse_geo_text`：自然语言 -> `UserGeolocusTriple[]`（LLM 实现）
- `compute_fuzzy_location`：三元组 -> 模糊位置渲染 JSON（写文件），并返回 `{ summary, filePath }`

当前前端实现了硬编码的对话与本地计算流程。我们需要一个真正的后端 agent 来完成：

1. 接收用户输入；2) 多步推理并调用 MCP 工具；3) 流式输出中间过程；4) 为前端提供安全获取渲染 JSON 文件的方式。

约束：

- Agent 后端是独立的 Express 服务（单独启动）。
- MCP Server 假设已运行（agent-server 不负责启动/守护进程）。
- 配置采用文件形式（`config.json` + `config.ts`），不依赖环境变量。
- 渲染 JSON 可能很大；agent 不应把完整渲染数据塞进模型上下文。

## Goals / Non-Goals

- Goals：
  - 提供一个支持多步工具调用的流式对话接口（ReAct 风格）。
  - 通过 HTTP 调用 MCP 工具并完成编排。
  - 提供安全的 results 获取 API，并限制为 MCP 输出目录下的文件。
  - 流式透传 tool-call/tool-result 事件，便于后续 UI 展示“正在处理/已完成/参数/结果”。
- Non-Goals：
  - 改造 `package/client` 接入新 agent（后续变更再做）。
  - results 清理 / TTL（明确延后）。
  - agent-server 启停或守护 `package/mcp-server`。

## Decisions

### Decision: Express + SSE

使用 Express 以 SSE 方式实现 `POST /api/chat` 的流式输出。这样可以获得低延迟交互体验，同时避免引入 WebSocket 的复杂度。

### Decision: Vercel AI SDK 多步工具调用（ReAct 风格）

使用 AI SDK 的 `streamText` 实现 agent，多步工具调用由模型驱动：

- tool set：通过 `@ai-sdk/mcp` 的 `createMCPClient` 获取 MCP tool set（自动把 MCP tools 转换为 AI SDK tools）
- multi-step：配置 `stopWhen` / step 上限，允许模型“调用工具 -> 读取结果 -> 再调用工具 -> 总结”
- system prompt：指导模型
  - 从用户文本推断 `geometryType`（point/line/polygon），必要时与用户确认
  - 先调用 `parse_geo_text`，再调用 `compute_fuzzy_location`
  - 当 MCP 返回错误（如 unresolved origins）时，引导用户补充信息或确认是否使用 agent 提议的 overrides

### Decision: 使用 AI SDK 官方 DeepSeek Provider

agent-server 使用 `@ai-sdk/deepseek` 创建模型实例。为满足“配置文件而非环境变量”的要求，使用 `createDeepSeek({ apiKey, baseURL })` 由 `config.json` 提供 `apiKey/baseURL/model` 并由 `config.ts` 校验。

### Decision: 使用 AI SDK 最新 6.x 版本

agent-server SHALL 使用 AI SDK 最新 6.x，以便获得稳定的 data stream、multi-step tool calling 与 MCP 集成能力。

### Decision: results API 只返回 allowlist 目录下的文件 JSON

提供 `GET /api/results/:id`，其中 `:id` 为文件 basename。服务端仅在 `results.allowedDir` 下解析该文件名，并拒绝任何路径穿越（例如 `..`、绝对路径）请求。

## Streaming Protocol (backend contract)

agent-server 流式输出的事件至少包含：

- assistant text delta
- tool-call（工具名 + 输入参数）
- tool-result（工具名 + 输出结果/错误）

实现上使用 AI SDK 官方 data stream response（方便后续直接对接 AI SDK UI）。如需自定义 SSE 事件格式，可将 `result.fullStream` 转换为 `{ type, ... }` 的 JSON 事件流。

## Risks / Trade-offs

- 工具调用错误（如 `unresolved_origins`）是常态；prompt 必须引导模型把错误解释清楚，并向用户索取缺失信息或提出可选 overrides 并征求确认。
- 读取结果文件属于安全敏感点；必须进行严格的目录 allowlist + 规范化路径校验。

## Migration Plan

1. 先落地 agent-server：稳定的接口与配置文件机制。
2. 后续变更再改造 `package/client`：接入 agent 的 chat stream 与 results API，替换浏览器端硬编码的 LLM 调用。

## Open Questions

- 本变更不阻塞的开放问题留待前端接入时确认（例如具体 UI 如何展示 tool 事件、何时触发地图渲染等）。
