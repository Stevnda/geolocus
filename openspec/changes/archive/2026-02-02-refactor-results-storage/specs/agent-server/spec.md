## MODIFIED Requirements

### Requirement: Results API 安全提供 MCP 渲染 JSON

agent-server SHALL 提供分层 results API，返回由 MCP `compute_fuzzy_location` 写入的计算结果（JSON 元数据与 PNG 热力图），且 SHALL 将读取限制在 allowlist 目录内。

#### Scenario: 通过 id 获取摘要信息

- **WHEN** 客户端请求 `GET /api/results/:id/summary`，且 `:id` 是 `results.allowedDir` 下的合法目录名
- **THEN** 服务端返回包含 `version`、`createdAt`、`geometryType`、`target`、`tripleCount`、`bbox`、`center` 的 JSON

#### Scenario: 通过 id 获取 GeoJSON 数据

- **WHEN** 客户端请求 `GET /api/results/:id/geojson`
- **THEN** 服务端返回包含 `resultGeoJSON` 和 `regionGeoJSON` 的 JSON

#### Scenario: 通过 id 获取 triple 列表

- **WHEN** 客户端请求 `GET /api/results/:id/triples`
- **THEN** 服务端返回 `tripleResults` 数组，每条包含 `coord`、`regionGeoJSON`、`pdfGridPath` 和 `pdfGridBbox`

#### Scenario: 获取合并区域热力图 PNG

- **WHEN** 客户端请求 `GET /api/results/:id/grids/region.png`
- **THEN** 服务端返回 `Content-Type: image/png` 的合并区域热力图

#### Scenario: 获取指定 triple 的热力图 PNG

- **WHEN** 客户端请求 `GET /api/results/:id/grids/:index.png`，且 `:index` 是有效的 triple 索引
- **THEN** 服务端返回对应 triple 的热力图 PNG

#### Scenario: 阻止路径穿越

- **WHEN** 客户端请求的 `:id` 试图进行路径穿越或访问绝对路径
- **THEN** 服务端拒绝请求并返回客户端错误
- **AND** 服务端不得读取 `results.allowedDir` 之外的任何文件或目录

## ADDED Requirements

### Requirement: MCP 计算结果以目录结构存储

MCP `compute_fuzzy_location` SHALL 将计算结果存储为目录结构，包含 JSON 元数据文件和 PNG 热力图文件，而非单个大 JSON 文件。

#### Scenario: 计算结果目录结构

- **WHEN** `compute_fuzzy_location` 完成计算
- **THEN** 结果存储为目录 `{outputDir}/{timestamp}_{type}_{target}/`
- **AND** 目录包含 `meta.json` 文件（含 triples、resultGeoJSON、regionGeoJSON、tripleResults）
- **AND** tripleResults 每条包含 `coord`、`regionGeoJSON`、`pdfGridPath` 和 `pdfGridBbox`
- **AND** meta.json 包含 `regionPdfGridPath` 和 `regionPdfGridBbox`（仅 point 类型）
- **AND** 目录包含 `grids/` 子目录
- **AND** `grids/` 下包含 `region.png`（合并区域热力图，仅 point 类型）
- **AND** `grids/` 下包含 `{index}.png`（每条 triple 的热力图）

#### Scenario: pdfGrid 预渲染为 PNG

- **WHEN** `compute_fuzzy_location` 处理 pdfGrid 数据
- **THEN** pdfGrid 二维数组 SHALL 被渲染为 PNG 图片
- **AND** PNG 使用彩虹色映射（靛蓝→蓝→绿→黄→橙→红）
- **AND** 概率值低于阈值的像素 SHALL 设为透明（alpha = 0）
- **AND** meta.json 中 SHALL 不包含原始 pdfGrid 数组
