# Change: 重构结果存储与分层 API

## Why

当前 MCP 计算结果保存为单个 JSON 文件（约 22MB），主要体积来自 `pdfGrid` 二维数组（每条 triple 的 256×256 浮点数）。这导致：

1. **传输效率低**：前端每次需下载完整 22MB 文件
2. **重复计算**：后端存 JSON 数组，前端又要转为 PNG 图片（`generateBlobPng`）
3. **全量返回**：前端可能只需要部分数据（如只需 GeoJSON 不需热力图）

## What Changes

- **MCP Server**：
  - `computeFuzzyLocation` 将 pdfGrid 预渲染为 PNG 图片存储
  - 结果文件从单个大 JSON 变为目录结构：`{id}/meta.json` + `{id}/grids/*.png`
  - JSON 文件从 22MB 降至约 100KB

- **Agent Server**：
  - **BREAKING**：移除原有 `/api/results/:id` 全量返回接口
  - 新增分层 API：
    - `GET /api/results/:id/summary` — 元数据 + bbox + center
    - `GET /api/results/:id/geojson` — resultGeoJSON + regionGeoJSON
    - `GET /api/results/:id/triples` — 每条 triple 的 coord + regionGeoJSON（不含 pdfGrid）
    - `GET /api/results/:id/grids/region.png` — 合并区域热力图
    - `GET /api/results/:id/grids/:index.png` — 第 N 条 triple 的热力图

## Impact

- Affected specs: `agent-server`
- Affected code:
  - `package/mcp-server/src/tools/computeFuzzyLocation/computeFuzzyLocation.ts`
  - `package/agent-server/src/index.ts`
  - `package/agent-server/src/results.ts`

