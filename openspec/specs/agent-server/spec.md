# agent-server Specification

## Purpose

TBD - created by archiving change add-agent-server-mcp. Update Purpose after archive.
## Requirements
### Requirement: Agent 后端提供流式对话接口

系统 SHALL 提供一个 HTTP API，通过 Server-Sent Events（SSE）流式输出 assistant 回复与工具调用进度，并使用 AI SDK 官方 data stream 格式承载事件。

#### Scenario: 流式输出文本与工具事件

- **WHEN** 客户端向 `POST /api/chat` 发送包含消息历史的请求
- **THEN** 服务端流式输出 assistant text delta
- **AND** 服务端为每次 MCP 工具调用流式输出 tool-call 与 tool-result 事件
- **AND** 当 agent 完成多步工作流时结束响应

### Requirement: Agent 后端使用 AI SDK 最新 6.x

agent-server SHALL 使用 AI SDK 最新 6.x 版本进行实现，以获得稳定的 data stream、多步工具调用与 MCP 集成能力。

#### Scenario: 依赖版本满足 6.x 约束

- **WHEN** 安装与构建 agent-server
- **THEN** 依赖清单中包含 `ai` 的 6.x 版本

### Requirement: Agent 通过 MCP 工具完成模糊定位推理

agent SHALL 通过 HTTP 调用 MCP 工具，完成从自然语言到模糊定位推理的工作流。

#### Scenario: 自然语言生成模糊定位结果文件

- **WHEN** 用户提供中文描述性地理位置文本
- **THEN** agent 通过 `@ai-sdk/mcp` 创建 MCP client 并获取工具集合
- **AND** agent 调用 MCP 工具 `parse_geo_text`，输入为 `{ text }`
- **AND** agent 从用户文本推断几何类型（`point`/`line`/`polygon`），必要时与用户确认
- **AND** agent 调用 MCP 工具 `compute_fuzzy_location`，输入为 `{ geometryType, triples, contextOverrides? }`
- **AND** agent 返回面向用户的回复，其中包含计算摘要与可用于 results API 的结果标识符

### Requirement: Agent 处理 MCP 错误并引导用户补充信息

agent SHALL 将 MCP 工具错误可解释地呈现给用户，并引导用户补充信息或确认是否使用 agent 提议的 overrides。

#### Scenario: MCP 返回 unresolved origins

- **WHEN** MCP `compute_fuzzy_location` 返回错误，提示存在未解析的参照物名称
- **THEN** agent 提示用户补充地点信息（例如坐标/几何）
- **OR** agent 提出可选的 overrides 并向用户确认是否使用

### Requirement: Agent 配置采用文件形式（不依赖环境变量）

agent-server SHALL 从本地 `config.json` 读取运行时配置，并由 `config.ts` 进行校验。该配置 SHALL 包含 DeepSeek Provider 所需的关键信息（例如 `apiKey/baseURL/model`）。

#### Scenario: 配置文件缺失或不合法

- **WHEN** `config.json` 缺失或不合法
- **THEN** 服务端快速失败，并给出清晰错误信息说明如何从 `config.example.json` 创建 `config.json`

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

### Requirement: Agent 不负责管理 MCP Server 进程

agent-server SHALL 假设 MCP server 已经运行，且 SHALL 不负责启动、停止或守护该进程。

#### Scenario: MCP server 不可用

- **WHEN** MCP base URL 不可达
- **THEN** agent-server 返回错误，说明 MCP 不可用并提示如何启动 MCP

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

