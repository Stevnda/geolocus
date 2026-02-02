# Change: 前端新增 Agent 流式对话模式并自动渲染计算结果

## Why

当前前端“AI 对话”与“计算结果”主要是硬编码：

- `package/client/src/util/deepseek.util.ts` 的 `deepseek()` 返回硬编码 JSON，并未流式输出，也未展示真实的工具调用过程。
- 地图渲染逻辑已存在（GeoJSON + pdfGrid 叠加 PNG），但触发链路与 AI 对话脱钩，无法在模型/工具成功后自动渲染与定位。

我们已经在后端具备 Agent Server（`/api/chat`）与分层 results API（`/api/results/:id/*`）。前端需要一个“真实 Agent 模式”，以：

1) 流式展示大模型输出；  
2) 流式展示 tool call 的调用、参数与返回；  
3) 当 `compute_fuzzy_location` 成功完成时，自动拉取 results 并渲染到 Mapbox 地图，同时自动定位与缩放。

## What Changes

### 前端（client）

- 在“描述类型”下拉框新增 `Agent` 选项；保留原有 `point/line/polygon` 与 `exam*` 硬编码分支不变。
- 新增“Agent 对话页渲染方式”：使用 AI SDK `messages/parts` 作为渲染数据源，逐 part 渲染：
  - `text`：流式文本
  - `tool-*`：展示工具状态机（input-streaming / input-available / output-available / output-error），并显示 `input`、`output`、`errorText`
  - 兼容 `dynamic-tool` 事件形态（部分 provider/协议会以 `toolName` 字段提供）
- 在 Agent 模式中，当检测到 `compute_fuzzy_location` 的 tool 结果 `ok=true`：
  - 计算 `resultsId = basename(filePath)`
  - 通过分层 results API 拉取 `summary/geojson/triples/grids` 并渲染地图
  - point：渲染 `region.png`（合并热力图）+ GeoJSON；line/polygon：渲染所有 triple 的热力图 PNG + GeoJSON
  - 使用 bbox 自动 `fitBounds` 并设置合适 padding / maxZoom
  - 清理上一轮渲染产生的 map source/layer，避免越画越多

### 后端（agent-server）

默认不改动（沿用现有 `/api/chat` 与 `/api/results/:id/*`）。开发环境优先通过 Vite proxy 解决同源与 SSE 问题；若必须跨域，再考虑增加 CORS（不作为本提案默认范围）。

## Impact

- 新增 capability spec：`client`
- Affected code（预计）：
  - `package/client/src/page/chat/Chat.tsx`
  - `package/client/src/page/chat/AgentChatBox.tsx`
  - `package/client/src/util/agent-results.util.ts`
  - `package/client/src/util/mapbox.util.ts`
  - `package/client/vite.config.ts`

