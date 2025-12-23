# 模糊定位 MCP 方案需求对齐

本文档用于记录当前已对齐的 MCP Server 方案：把「自然语言→三元组」与「三元组→模糊位置计算」封装为 MCP 工具，并解决“渲染数据很大，不应进入 agent 上下文”的问题。

---

## 1. 背景与目标

### 1.1 背景

- 项目中现有流程（前端侧）大致是：
  - 自然语言 →（LLM）→ `UserGeolocusTriple[]`（三元组）
  - `UserGeolocusTriple[]` →（`@geolocus/core`）→ `RegionResult`（模糊点/线/面结果）
  - `RegionResult` →（Mapbox）→ 渲染：区域面/线、代表点、概率栅格图等

### 1.2 目标（MCP Server 提供两个工具）

1. 工具1：自然语言输出三元组（`UserGeolocusTriple[]`）
2. 工具2：调用模糊位置引擎（`@geolocus/core`）计算模糊位置（点/线/面）

### 1.3 关键约束

- **无状态**：MCP Server 不保存会话语义状态，状态交给客户端/agent 管理。
- **target 一致性**：工具2强制要求三元组中所有 `target` 一致，不一致直接报错。
- **大数据不进入 agent 上下文**：完整渲染数据写入本地文件，工具2只返回小体积 `summary + filePath`。
- **deepseek 配置**：从配置文件读取（不使用环境变量，不作为工具参数）。
- **输出目录**：从配置文件读取；默认是 `package/mcp-server/temp-files/`（即 `mcp-server` 目录下的 `temp-files`），由 MCP Server 把完整渲染数据写入该目录并返回 `filePath`。

---

## 2. 核心数据结构（项目现状）

### 2.1 三元组：`UserGeolocusTriple`

来源：`@geolocus/core` 的公开类型定义。

- 定义位置：`package/core/src/index.ts:38`
- 关键点：该类型 **包含 `role: string` 字段**，所以工具1需要保证输出包含 role（默认 `'default'`）。

### 2.2 计算结果：`RegionResult`

定义位置：`package/core/src/region/region.type.ts:46`

```ts
export interface RegionResult {
  geoTripleList: GeoTriple[]
  geoTripleResultList: GeoTripleResult[]
  region: GeolocusObject | null
  regionPdfGrid: GeolocusGrid | null
  result: GeolocusObject | null
}
```

注意：`RegionResult` 内含 `GeolocusObject/Role` 等“类实例”，**不适合直接作为 MCP tool 大结果塞进 agent 上下文**。因此工具2采用“写文件返回路径”的方案。

---

## 3. MCP 工具设计

### 3.1 工具1：自然语言 → 三元组

**工具名（建议）**

- `parse_geo_text`

**输入**

- `text: string`（纯文本；不传 role、geometryType）

**输出（成功）**

- `ok: true`
- `data: UserGeolocusTriple[]`
  - server 端会给每条补齐 `role: "default"`（如果 LLM 没返回或返回不符合）

**输出（失败）**

- `ok: false`
- `error: string`（错误原因，便于 agent 判断下一步）
- `rawText?: string`（deepseek 原始输出，便于 agent 修复/重试）
- `details?: object`（可选：例如 JSON parse error、目标不一致的 target 列表）

**说明：为什么工具1不需要 role/geometryType**

- role/geometryType 属于“策略层”（客户端/agent 决定本次要算点/线/面、采用哪个角色解释）。
- 工具1只负责把自然语言抽取成结构化约束（参照物、关系、目标），不做推理。

**prompt 约束（为 MCP 做的轻微调整）**

- 提示词沿用原项目（`package/client/src/util/deepseek.util.ts`）的内容，但要额外强制模型：
  - 只输出“纯 JSON”（JSON array），不要 Markdown、不要代码块（```）、不要解释性文字；
  - 输出必须能被 `JSON.parse` 直接解析；
  - 输出必须是 `UserGeolocusTriple[]`，不得附加其他字段。

---

### 3.2 工具2：三元组 → 模糊位置计算

**工具名（建议）**

- `compute_fuzzy_location`

**输入**

```ts
{
  geometryType: 'point' | 'line' | 'polygon'
  triples: UserGeolocusTriple[]
  contextOverrides?: object
}
```

**校验**

- `triples.length > 0`
- `triples` 内所有 `target` 必须一致，否则：
  - `ok: false`
  - `error: 'multiple_targets'`
  - `details: { targets: string[] }`

**输出（成功）**

- `ok: true`
- `summary: object`（小体积，用于 agent 判断是否需要修复/追问/重试）
- `filePath: string`（完整渲染数据落地文件路径；由客户端读取渲染，不进入 agent 上下文）

**输出（失败）**

- `ok: false`
- `error: string`
- `details?: object`

---

## 4. 为什么要“写文件返回路径”（方案 B）

### 4.1 问题：结果数据量大且不适合进入 agent 上下文

- `regionPdfGrid: number[][]`（如 256×256）体积可观；
- GeoJSON（面/线）坐标点多时体积也可能很大；
- MCP tool 的返回若直接进入 agent 上下文，会浪费 token、影响推理稳定性。

### 4.2 方案 B 的效果

- agent 只拿到 `summary`（小体积、可读、可用于判断）
- 客户端用 `filePath` 读取 JSON 文件拿到完整渲染数据（给 UI/地图渲染用）

---

## 5. summary 设计（agent 可读、体积可控）

目标：让 agent 用很小的数据量判断：

- 本次计算是否成功？
- 是否存在地名解析失败导致结果不可信？
- 结果是否“离谱”（比如 bbox 覆盖范围异常大）？
- 下一步应该：追问用户补充信息 / 重试解析 / 直接返回结果？

建议字段（可调整）：

```ts
type Summary = {
  geometryType: 'point' | 'line' | 'polygon'
  target: string
  tripleCount: number
  originNameCount: number
  originNamesSample: string[] // 最多 N=10

  placeResolved: number
  placeUnresolved: number
  unresolvedNames: string[] // 最多 N=10
  unresolvedTruncated?: boolean

  resultNull: boolean
  regionNull: boolean
  gridNull: boolean

  bboxWgs84: [number, number, number, number] | null
  centerWgs84: [number, number] | null

  gridStats?: { min: number; max: number; mean: number; p95: number } | null
  ambiguity?: 'low' | 'medium' | 'high'

  warnings: string[]
  nextActionHint?: string
}
```

体积控制原则：

- 不返回 `regionPdfGrid`、不返回完整 GeoJSON 坐标数组（这些进文件）。
- 所有列表截断（例如最多 10 个 name），避免输出膨胀。

---

## 6. filePath 文件内容（渲染数据 JSON）

工具2会把“完整渲染所需数据”写成 JSON 文件，建议结构：

```json
{
  "version": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "geometryType": "point",
  "target": "新街口",
  "render": {
    "resultGeoJSON": { "...": "GeoJSON" },
    "regionGeoJSON": { "...": "GeoJSON or null" },
    "regionPdfGrid": [[0.0, 0.1], [0.2, 0.3]],
    "bboxWgs84": [minLon, minLat, maxLon, maxLat]
  },
  "debug": {
    "geoTripleResultList": []
  }
}
```

---

## 7. 配置文件（MCP Server 运行必需）

### 7.1 配置文件位置（建议）

- 推荐：`package/mcp-server/geolocus-mcp.config.json5`（JSON5 支持注释/尾逗号，便于写说明；实现用 `json5` 解析）
- 建议做法：将 `package/mcp-server/geolocus-mcp.config.example.json5` 复制为 `package/mcp-server/geolocus-mcp.config.json5` 后填写 `apiKey`（该文件应保持在 `.gitignore` 中）

### 7.2 配置内容（建议）

```json5
{
  deepseek: {
    // deepseek 服务地址
    baseUrl: 'https://api.deepseek.com',
    // API Key（本地维护，不建议提交到仓库）
    apiKey: 'YOUR_KEY',
    // 不作为工具参数暴露，统一由配置文件控制
    model: 'deepseek-chat',
  },
  output: {
    // 输出目录：相对于 package/mcp-server 目录解析
    // 默认建议为 "./temp-files"
    dir: './temp-files',
  },
}
```

说明：

- `output.dir`：
  - 默认按“package/mcp-server 目录”解析为 `./temp-files/`（即 `package/mcp-server/temp-files/`）；
  - MCP Server 负责创建目录（如果不存在）；
  - 工具2写入 `*.json` 文件并返回绝对路径 `filePath`。

---

## 8. 实现约定（使用官方 MCP SDK）

- MCP 服务器使用官方 SDK：`@modelcontextprotocol/sdk`
- 传输方式：stdio
