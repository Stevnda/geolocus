## 1. Implementation

- [x] 1.1 初始化 `package/agent-server`（TypeScript ESM、scripts、对齐仓库 lint/format 约定）
- [x] 1.1.1 依赖版本要求：使用 AI SDK 最新 6.x（例如 `ai@^6`），并安装 `@ai-sdk/deepseek`、`@ai-sdk/mcp`
- [x] 1.2 增加 agent-server 配置加载：`config.example.json`、`config.json`（gitignore）、`src/config.ts`（Zod 校验）
- [x] 1.3 使用 `@ai-sdk/mcp` 实现 MCP Client：`createMCPClient({ transport: { type: 'http', url: mcp.baseUrl } })` 并获取 tool set
- [x] 1.4 实现对话 SSE 接口：`POST /api/chat`
  - [x] 多步工具调用（AI SDK `streamText` + `stopWhen` / step 上限）
  - [x] ReAct 风格 system prompt（优先工具、必要时澄清、推断几何类型）
  - [x] 使用 AI SDK 官方 data stream 输出（assistant text delta + tool-call/tool-result 事件）
- [x] 1.5 实现 results 接口：`GET /api/results/:id`
  - [x] 限制文件读取范围：仅允许 `results.allowedDir`
  - [x] 返回 `compute_fuzzy_location` 写入的 JSON payload
- [x] 1.6 增加测试（Vitest）覆盖：
  - [x] 配置校验（缺字段、类型不匹配）
  - [x] results 路径穿越防护
  - [x] MCP 错误透传形状（agent 如何呈现错误）
- [x] 1.7 增加最小文档：本地如何配置并运行 agent-server（前提：mcp-server 已运行）
- [x] 1.8 抽离 system prompt 为单独文件并加载，保持 prompt 仅描述行为而不硬编码工具列表
- [x] 1.9 增加真实请求 smoke 脚本（需填写 `config.json`）用于验证 DeepSeek 与 MCP 连通性

## 2. Validation

- [x] 2.1 运行 `openspec validate add-agent-server-mcp --strict --no-interactive`
- [x] 2.2 确认 `pnpm -C package/agent-server lint` 与 `pnpm -C package/agent-server test` 通过
