## 1. MCP Server — pdfGrid PNG 渲染

- [x] 1.1 添加 `sharp` 依赖到 `package/mcp-server/package.json`
- [x] 1.2 创建 `package/mcp-server/src/tools/computeFuzzyLocation/pngRenderer.ts`
  - 移植 `getColorFromRainbow` 颜色映射逻辑
  - 实现 `renderGridToPng(grid: number[][], min?: number): Promise<Buffer>`
- [x] 1.3 修改 `computeFuzzyLocation.ts`：
  - 修改 `RenderFile` 类型，移除原始 `regionPdfGrid` 和 `tripleResults[].pdfGrid.grid`
  - 新增 `regionPdfGridPath`、`regionPdfGridBbox` 字段（仅 point 类型）
  - 新增 `tripleResults[].pdfGridPath` 和 `tripleResults[].pdfGridBbox` 字段
- [x] 1.4 修改 `writeResultFile` 函数：
  - 创建目录结构 `{id}/` 和 `{id}/grids/`
  - 调用 `renderGridToPng` 生成 PNG 并写入文件
  - 返回目录路径而非单文件路径
- [x] 1.5 为 PNG 渲染逻辑编写单元测试

## 2. Agent Server — 分层 API

- [x] 2.1 修改 `results.ts`：
  - 新增 `resolveResultsDir` 函数（校验目录而非单文件）
  - 新增 `readMetaJson` / `readPngFile` 辅助函数
- [x] 2.2 修改 `index.ts`，新增分层端点：
  - `GET /api/results/:id/summary` — 返回 `{ version, createdAt, geometryType, target, tripleCount, bbox, center }`
  - `GET /api/results/:id/geojson` — 返回 `{ resultGeoJSON, regionGeoJSON }`
  - `GET /api/results/:id/triples` — 返回 `tripleResults[]`（含 coord + regionGeoJSON + pdfGridPath + pdfGridBbox）
  - `GET /api/results/:id/grids/region.png` — 返回 region pdfGrid PNG 图片
  - `GET /api/results/:id/grids/:index.png` — 返回第 index 条 triple 的 pdfGrid PNG
- [x] 2.3 移除原有 `GET /api/results/:id` 端点（**BREAKING**）
- [x] 2.4 为分层 API 编写集成测试

## 3. 验证与文档

- [x] 3.1 手动测试：MCP Server 计算并生成新格式文件
- [x] 3.2 手动测试：Agent Server 分层 API 返回正确数据
- [x] 3.3 更新 README 或 API 文档（如有）

## Dependencies

- 1.x 完成后才能进行 2.x
- 1.5 和 2.4 可与其他任务并行

## Parallelizable

- 1.1 + 1.2 可并行
- 2.1 + 2.2 可并行（但 2.2 依赖 2.1 的类型）

