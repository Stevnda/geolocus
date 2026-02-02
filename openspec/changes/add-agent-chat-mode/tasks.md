## 1. 前端：新增 Agent 模式（保留硬编码）

- [x] 1.1 在 `Chat.tsx` 下拉框新增 `Agent` 选项，并保持现有 `exam*` 与 `point/line/polygon` 分支逻辑不变
- [x] 1.2 新增 Agent 模式的对话实现：使用 `@ai-sdk/react` `useChat()` 连接 agent-server `/api/chat`（SSE）
- [x] 1.3 使用 `messages/parts` 渲染对话内容（text 与 tool-*），展示 tool 的 state/input/output/errorText（并兼容 dynamic-tool）

## 2. 前端：自动拉取 results 并渲染地图

- [x] 2.1 监听 `compute_fuzzy_location` 的 `output-available`，以 `toolCallId` 去重
- [x] 2.2 从 `filePath` 计算 `resultsId`，请求：
  - `/api/results/:id/summary`
  - `/api/results/:id/geojson`
  - `/api/results/:id/triples`
  - point：`/api/results/:id/grids/region.png`
  - line/polygon：对每条 triple 请求 `/api/results/:id/grids/:index.png`
- [x] 2.3 按 geometryType 渲染：
  - point：region 合并热力图 + GeoJSON
  - line/polygon：所有 triple 热力图 + GeoJSON
- [x] 2.4 自动定位与缩放：用 bbox 转 WGS84 后 `fitBounds`，并清理上一轮渲染图层/数据源

## 3. 验证

- [x] 3.1 手动验证：Agent 模式可流式显示文本与 tool 调用过程
- [x] 3.2 手动验证：`compute_fuzzy_location` 成功后自动渲染并 fitBounds；point/line/polygon 均符合预期
- [x] 3.3 回归验证：原有硬编码模式（exam*、point/line/polygon）行为不变

