# @geolocus/agent-server

一个独立的 Agent 后端服务（Express），用于把“前端对话输入”转换为“可渲染的模糊定位结果”：

- AI SDK 6.x：流式 data stream 输出（包含 tool-call/tool-result）
- `@ai-sdk/deepseek`：模型调用（配置来自 `config.json`，不使用环境变量）
- `@ai-sdk/mcp`：原生连接 MCP Server（HTTP `/mcp`），自动把 MCP tools 转成 AI SDK tools

## 前置条件

- Node.js + pnpm
- MCP Server 已运行（建议：`pnpm -C package/mcp-server dev:http`）

## 配置

复制并填写配置文件：

```powershell
cd package/agent-server
Copy-Item config.example.json config.json
```

关键字段：

- `deepseek.apiKey`：必须填写真实 key
- `mcp.baseUrl`：默认 `http://127.0.0.1:3000/mcp`
- `results.allowedDir`：默认 `package/mcp-server/temp-files`（结果文件读取 allowlist）

## 启动

```powershell
pnpm -C package/agent-server dev
```

健康检查：

- `GET /healthz`

## 接口

### 1) 对话（流式）

`POST /api/chat`

- 请求体：`{ "messages": [...] }`（AI SDK UIMessage 结构）
- 返回：AI SDK UI message stream（SSE），包含文本 delta 与 tool 事件

说明：

- 服务端不会把结果文件大 JSON 塞进模型上下文
- 结果文件通过 `GET /api/results/:id` 获取

### 2) 结果文件读取

`GET /api/results/:id`

- `:id` 为结果文件名（basename）
- 服务端仅允许读取 `results.allowedDir` 下的文件，并阻止路径穿越

## Smoke Test（真实连通性）

在你已经：

- 填好 `package/agent-server/config.json` 的 `deepseek.apiKey`
- 启动了 MCP Server（HTTP）

执行：

```powershell
pnpm -C package/agent-server smoke
```

该命令会：

- 对 DeepSeek 发起一次真实请求并打印返回文本
- 连接 MCP Server 并打印可用 tools 列表
