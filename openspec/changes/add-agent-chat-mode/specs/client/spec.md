## ADDED Requirements

### Requirement: 前端支持 Agent 流式对话模式

client SHALL 在现有硬编码对话/渲染模式之外，新增一个 `Agent` 模式，用于连接 agent-server 并流式渲染对话。

#### Scenario: 通过下拉框进入 Agent 模式

- **WHEN** 用户在“描述类型”下拉框选择 `Agent`
- **THEN** 前端进入 Agent 对话模式
- **AND** 原有 `point/line/polygon` 与 `exam*` 硬编码模式仍可使用

#### Scenario: 流式展示模型输出文本

- **WHEN** 用户在 Agent 模式提交消息
- **THEN** 前端 SHALL 以流式方式展示 assistant 的 `text` part

### Requirement: 前端展示 tool 调用过程（含入参/结果）

client SHALL 展示 tool 调用的状态、参数与结果，支持 input-streaming/input-available/output-available/output-error，并兼容 dynamic-tool 事件形态。

#### Scenario: 展示 tool 调用与参数

- **WHEN** assistant 触发任意工具调用
- **THEN** 前端 SHALL 显示工具名与当前 state
- **AND** 前端 SHALL 显示工具 `input`（可为 partial 或完整）

#### Scenario: 展示 tool 结果或错误

- **WHEN** 工具执行完成
- **THEN** 前端 SHALL 显示 `output`（output-available）或 `errorText`（output-error）

### Requirement: compute_fuzzy_location 成功后自动渲染地图并定位

client SHALL 在 `compute_fuzzy_location` 工具成功（ok=true）后自动渲染结果到 Mapbox 地图，并进行合适的定位与缩放。

#### Scenario: 根据 toolCallId 去重触发渲染

- **WHEN** `compute_fuzzy_location` 的结果以流式方式更新
- **THEN** 前端 SHALL 使用 `toolCallId` 去重，确保每次工具调用只触发一次地图渲染

#### Scenario: point 渲染 region 合并热力图

- **WHEN** 工具返回的结果 `summary.geometryType = point`
- **THEN** 前端 SHALL 请求并渲染 `region.png`（合并热力图）
- **AND** 前端 SHALL 叠加 `regionGeoJSON` 与 `resultGeoJSON`
- **AND** 前端 SHALL 根据 bbox 自动 fitBounds

#### Scenario: line/polygon 渲染全部 triple 热力图

- **WHEN** 工具返回的结果 `summary.geometryType = line` 或 `polygon`
- **THEN** 前端 SHALL 请求并渲染 `tripleResults[]` 中全部 triple 的热力图 PNG
- **AND** 前端 SHALL 叠加 `resultGeoJSON`
- **AND** 前端 SHALL 根据 bbox 自动 fitBounds

#### Scenario: 清理旧图层避免叠加

- **WHEN** 新一轮 `compute_fuzzy_location` 成功并准备渲染
- **THEN** 前端 SHALL 清理上一轮渲染产生的相关 map layer/source

