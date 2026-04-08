# Change: 新增 Agent 后端（Express + Vercel AI SDK）并接入 MCP 工具

## Why

- 目前 `package/client` 的“AI 对话”流程是硬编码的：不具备真正的 agent 多步推理与工具编排能力。
- 模型/API Key 不应放在浏览器端；需要把 LLM 调用迁移到服务端以满足安全与可维护性要求。
- 项目已存在 MCP Server，提供两个核心工具（`parse_geo_text`、`compute_fuzzy_location`）；需要一个后端 agent 能够多步调用这两个工具，并将处理进度以流式形式返回给前端。

## What Changes

- 新增一个服务端包：`package/agent-server`（Node + Express，TypeScript ESM）。
- 提供一个流式对话接口（SSE），运行一个多步工具调用的 agent（以 AI SDK 的 multi-step tool calling 实现 ReAct 风格循环）：
  - 工具 1：调用 MCP `parse_geo_text`（自然语言 -> `UserGeolocusTriple[]`）
  - 工具 2：调用 MCP `compute_fuzzy_location`（三元组 + agent 推断的 `geometryType` -> `{ summary, filePath }`，并把渲染 JSON 写入文件）
- 提供 results 接口：安全读取 MCP 写入的渲染 JSON 文件并返回给前端。
- 使用 AI SDK **最新 6.x** 版本。
- 使用 AI SDK 的 DeepSeek Provider（`@ai-sdk/deepseek`）。
- 使用 AI SDK 原生 MCP 支持（`@ai-sdk/mcp`），通过 `createMCPClient` 连接 MCP Server 并自动将 MCP tools 转换为 AI SDK tools。
- 引入 `config.json` + `config.ts`（Zod 校验）作为运行时配置来源；**不依赖环境变量**。

## Impact

- 影响的运行组件：
  - 新增：`package/agent-server`（独立于 `package/mcp-server` 启动）
  - 既有：`package/mcp-server` 仍然是工具 I/O 与结果文件写入的唯一来源
- 本变更不包含前端改造；后端将提供稳定接口供后续前端接入。
- agent 后端将新增依赖（Vercel AI SDK provider/streaming、Express、Zod 等）。
