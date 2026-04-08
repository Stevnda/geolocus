# 项目上下文（Geolocus）

## 目的
Geolocus 是一个空间推理系统，用于将自然语言的地理描述转换为可计算的空间表达，并输出可视化/可落地的结果：模糊位置区域（面）、概率栅格（分布）与代表性点。

典型流程：用户输入中文自然语言地理描述 → LLM 将文本解析为空间“三元组”（起点/参考 → 关系 → 目标）→ `@geolocus/core` 进行空间推理与模糊定位计算 → 前端在地图上可视化结果。

## 技术栈
- 语言/运行时：TypeScript（ESM）、Node.js
- 包管理/工程组织：pnpm、Monorepo（`package/*`）
- 前端：React 18、Vite、Ant Design、Zustand、Mapbox GL、ECharts、Tailwind（辅助工具链）
- 空间与几何：JSTS（封装于 `@geolocus/jsts`）、Concave hull（封装于 `@geolocus/concave`）、Turf（部分投影/简化）
- 服务端：Express 5、Zod
- MCP：`@modelcontextprotocol/sdk`（MCP Server）
- 测试：Vitest（含 bench / coverage）
- 质量与规范：ESLint（严格：`max-warnings 0`）、Prettier、Husky + lint-staged、Commitlint（Conventional Commits）

## 项目约定

### 代码风格
- ESM 为主（`"type": "module"`）。
- Prettier（各包内 `prettier.config.cjs`）：`tabWidth: 2`、`semi: false`、`singleQuote: true`、`printWidth: 80`。
- ESLint（各包内 `.eslintrc.cjs`）：基于 `eslint:recommended`、`standard`、`@typescript-eslint`、`import`，并启用 `plugin:prettier/recommended`。
- TypeScript：严格模式（各包 `tsconfig` 约束为准），尽量用显式类型与可读的命名表达空间语义。

### 架构与目录模式
Monorepo 主体位于 `package/`：
- `package/core/`：空间推理引擎（对外以 `@geolocus/core` 暴露）。
- `package/client/`：React Web（聊天 + 地图交互，可视化推理结果）。
- `package/mcp-server/`：MCP 协议服务端（对接 LLM，提供工具：解析文本、计算模糊位置等）。
- `package/jsts/`：JSTS 的封装与适配层。
- `package/concave/`：Concave hull 计算封装。

依赖关系：`client` → `core` → `jsts`/`concave`；`mcp-server` → `core`。

核心领域模型（概念层面）：将输入解析为“空间三元组”（origin → relation → target），`core` 负责把这些约束融合为可计算的空间结果（区域/分布/点）。

### 测试策略
- 使用 Vitest：
  - 根目录：`pnpm test`（运行 `vitest test`）
  - 各包：`pnpm -C package/<name> test`（以包内 `vitest.config.ts` 为准）
- 单测文件：`*.test.ts`
- 覆盖率：提供 `test:coverage` 脚本（是否强制门槛以 CI/本地约束为准）

### Git 工作流
- 提交规范：Conventional Commits（`commitlint.config.js` 继承 `@commitlint/config-conventional`）。
- 提交前检查：Husky + lint-staged；建议在提交前运行 `pnpm format`（Prettier + ESLint）。

## 领域上下文（AI 助手需要知道的事）
- 系统输入通常为中文自然语言地理描述，且描述具有模糊性（方向/距离/拓扑关系等）。
- “关系”不仅是方位（N/NE/E…）与距离（数值或分级），也可能包含拓扑（包含、相交、相离、沿着、朝向等）。
- 输出包含：
  - 模糊区域（多边形/面）
  - 概率栅格（空间概率分布）
  - 代表性点（用于定位/展示/后续计算）
- 前端以地图（Mapbox GL）为主要载体承载交互与展示；MCP Server 用于将 LLM 能力对外以工具形式暴露。

## 重要约束
- 保持结果“可解释”：空间推理链路应尽量能追溯（输入约束 → 计算过程 → 输出）。
- 地理数据/地名目录可能较大：对 `place catalog` 等静态资源的加载与检索需要注意性能与内存占用。
- ESM/TypeScript 工程一致性：避免引入与现有工具链冲突的 CommonJS-only 依赖或不兼容的构建方式。

## 外部依赖
- 地图与可视化：Mapbox GL、ECharts。
- LLM：前端使用 `openai` SDK（实际模型/供应商以运行时配置为准）；MCP Server 侧集成 LLM（项目描述中提及 DeepSeek）。
- MCP：`@modelcontextprotocol/sdk`（工具协议与传输：stdio/HTTP）。
