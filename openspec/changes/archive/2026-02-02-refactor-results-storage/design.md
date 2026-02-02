## Context

MCP Server 的 `computeFuzzyLocation` 将完整的计算结果（含原始 pdfGrid 二维数组）序列化为单个 JSON 文件。Agent Server 通过 `/api/results/:id` 将该文件全量返回给前端。文件体积约 22MB，其中 pdfGrid 占比超过 99%。前端拿到后还需调用 `generateBlobPng` 将数组转为 PNG 才能叠加到 MapBox GL 地图。

## Goals / Non-Goals

- Goals:
  - 将 pdfGrid 在后端预渲染为 PNG，消除前端转换开销
  - 将结果文件大小从 ~22MB 降至 ~100KB（JSON）+ 少量 PNG 图片
  - 提供分层 API，前端可按需加载不同粒度的数据
- Non-Goals:
  - 不改动 `@geolocus/core` 的计算逻辑
  - 不在本提案中改造前端（前端对接另开提案）
  - 不做 CDN 或缓存优化

## Decisions

### 1. pdfGrid 预渲染为 PNG（不保留原始数组）

- **决定**：MCP Server 在写入文件时将 pdfGrid 渲染为 PNG 文件，JSON 中只存储 PNG 文件路径和 bbox
- **原因**：前端最终需要的是图片；原始数组导致文件膨胀到 22MB；用户确认不需要保留原始数据
- **替代方案**：同时保留数组和图片 → 放弃，因为增加存储且无需求场景

### 2. Node.js 端 PNG 生成方案

- **决定**：使用 `sharp` 库从 raw RGBA buffer 生成 PNG
- **原因**：`sharp` 是 Node.js 端最成熟的图片处理库，无需 Canvas/DOM 依赖，性能优秀
- **替代方案**：`canvas`（node-canvas）→ 需要原生依赖编译，更重；`pngjs` → 可行但无压缩优化

### 3. 结果文件从单文件变为目录结构

- **决定**：
  ```
  temp-files/{timestamp}_{type}_{target}/
  ├── meta.json        # triples + resultGeoJSON + regionGeoJSON + tripleResults(coord+regionGeoJSON+grid引用)
  └── grids/
      ├── region.png   # 合并区域 pdfGrid
      ├── 0.png        # triple[0] 的 pdfGrid
      ├── 1.png        # triple[1] 的 pdfGrid
      └── ...
  ```
- **原因**：分离二进制（PNG）和结构化数据（JSON），便于分层 API 按需提供

### 4. 分层 API 设计

- **决定**：拆分为 5 个端点（summary / geojson / triples / grids/region.png / grids/:index.png）
- **原因**：前端不同场景需要不同粒度的数据；图片可直接通过 URL 加载到 MapBox GL

### 5. 颜色映射逻辑

- **决定**：将前端 `image.util.ts` 中的彩虹色映射逻辑（`getColorFromRainbow`）移植到 MCP Server 端
- **原因**：保证后端生成的 PNG 与前端当前渲染效果一致

### 6. 显式存储 pdfGrid bbox

- **决定**：在 `meta.json` 中为每张 PNG 显式存储 `pdfGridBbox: [minX, minY, maxX, maxY]`
- **原因**：前端需要 bbox 才能将 PNG 定位到 MapBox GL 地图正确位置。虽然 `regionGeoJSON` 可以提取 bbox，但显式存储更直接，避免前端额外解析
- **数据结构**：
  ```json
  {
    "tripleResults": [
      {
        "coord": [x, y],
        "regionGeoJSON": { ... },
        "pdfGridPath": "grids/0.png",
        "pdfGridBbox": [minX, minY, maxX, maxY]
      }
    ],
    "regionPdfGridPath": "grids/region.png",
    "regionPdfGridBbox": [minX, minY, maxX, maxY]
  }
  ```

## Risks / Trade-offs

- `sharp` 引入原生依赖 → 在主流平台（Linux/macOS/Windows）有预编译二进制，风险低
- MCP Server 计算时间略增（PNG 编码） → PNG 编码 256×256 图片耗时 <10ms，可忽略
- 不保留原始 pdfGrid 数组 → 如果未来需要数值分析则需要重新计算；当前无此需求

## Open Questions

- PNG 的默认透明度阈值（当前前端默认 `min = 0.05`）是否需要可配置？

