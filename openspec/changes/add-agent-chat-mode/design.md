## Context

目前前端地图渲染已具备：

- GeoJSON 图层（circle/line/fill）
- pdfGrid → PNG（canvas 生成）并通过 Mapbox `image` source + raster layer 叠加
- bbox 坐标转换：内部为 Mercator（米制坐标），需转 WGS84 经纬度供 Mapbox 使用

后端已具备：

- Agent Server `/api/chat`：AI SDK UI message stream（SSE），包含 tool-call/tool-result 事件
- 分层 results API：`/api/results/:id/summary|geojson|triples|grids/*.png`

## Goals / Non-Goals

- Goals:
  - 前端新增 Agent 模式，使用 AI SDK `messages/parts` 做流式渲染
  - 前端可见 tool 调用过程（状态、参数、结果）
  - `compute_fuzzy_location` 工具成功后自动渲染地图并 fitBounds
  - point 显示 region 合并热力图；line/polygon 显示全部 triple 热力图
  - 保留现有硬编码模式（下拉框新增 Agent）
- Non-Goals:
  - 不在本提案中重做 UI 视觉设计（以可用为主）
  - 不在本提案中修改 core 算法
  - 默认不改 agent-server 协议（除非被浏览器同源/SSE 强制要求）

## Decisions

### 1) 前端流式渲染：AI SDK `useChat` + message.parts

- **决定**：Agent 模式使用 `@ai-sdk/react` 的 `useChat()`，并以 `message.parts` 为 UI 数据源。
- **原因**：parts 天然包含 tool 状态机与 stream 协议事件，能直接满足“展示 tool call 参数/结果”的需求。

### 2) 自动渲染触发：以 `toolCallId` 去重

- **决定**：监听 `compute_fuzzy_location` 工具的 `output-available`，以 `toolCallId` 做去重，保证一次工具调用只触发一次地图渲染。
- **原因**：React 渲染与消息更新可能多次触发 effect；需要稳定标识避免重复叠加图层。

### 3) resultsId 来源：从 `filePath` 取 basename

- **决定**：`resultsId = basename(filePath)` 由前端直接计算（`split(/[\\/]/).pop()`）。
- **原因**：避免再引入额外 tool 或二次请求；agent-server results API 以 basename 作为 id。

### 4) 地图渲染策略

- point：
  - 渲染 `region.png`（合并热力图）+ `regionGeoJSON`（fill）+ `resultGeoJSON`（circle）
- line/polygon：
  - 遍历 `tripleResults[]`，渲染全部 triple 的 `grids/{index}.png`
  - 叠加 `resultGeoJSON`（line 或 fill）

### 5) 自动定位与缩放

- **决定**：优先使用 `summary.bbox`（EPSG:3857）转换为 WGS84 后 `map.fitBounds()`；设置 padding 与 maxZoom。

## Risks / Trade-offs

- 大量 triple 时渲染所有 PNG 可能导致 UI 卡顿（后续可加并发/节流与图层管理策略）。
- SSE 跨域在浏览器下易出问题：开发环境建议 Vite proxy；生产再考虑同源部署或 CORS。

