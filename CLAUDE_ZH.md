# CLAUDE_ZH.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

Geolocus 是一个空间推理系统，将自然语言地理描述转换为精确的空间坐标和区域。系统将用户输入解析为"空间三元组"（起点 → 关系 → 目标），然后计算模糊位置区域、概率网格和代表性点。

## Monorepo 结构

```
package/
├── core/       - 空间推理引擎（TypeScript 库）
├── client/     - React Web 应用（Vite、MapBox GL、ECharts）
├── mcp-server/ - MCP 协议服务器（DeepSeek LLM 集成）
├── jsts/       - JavaScript Topology Suite 封装
└── concave/    - 凹包计算封装
```

**依赖关系**: `client` → `core` → `jsts`, `concave`; `mcp-server` → `core`

## 常用命令

```bash
# 安装依赖
pnpm install

# 根目录命令
pnpm lint              # 检查所有包（max-warnings 0）
pnpm format            # Prettier + lint
pnpm test              # 运行所有测试
pnpm test:coverage     # 测试覆盖率

# Client（React 前端，端口 5678）
pnpm -C package/client dev
pnpm -C package/client build
pnpm -C package/client test

# Core（空间推理库）
pnpm -C package/core build
pnpm -C package/core test

# MCP Server
pnpm -C package/mcp-server dev        # stdio 模式
pnpm -C package/mcp-server dev:http   # HTTP 模式
pnpm -C package/mcp-server build

# 运行单个测试文件
pnpm -C package/core test src/region/region.test.ts
```

## 核心概念

### UserGeolocusTriple

表示空间关系的核心数据结构：

```typescript
interface UserGeolocusTriple {
  role: string                    // 视角/观察者角色
  tupleList: {
    originList?: OriginOrTriple[] // 参考点/几何体
    relation?: {
      topology?: 'disjoint' | 'contain' | 'within' | 'intersect' | 'along' | 'toward'
      direction?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'F' | 'R' | 'B' | 'L' | ...
      distance?: number | [min, max] | 'VN' | 'N' | 'M' | 'F' | 'VF'
      range?: 'inside' | 'outside' | 'both'
    }
  }[]
  target: string                  // 要定位的地名
}
```

### 工作流程

1. 用户输入地理描述（中文自然语言）
2. LLM（DeepSeek）将文本转换为 `UserGeolocusTriple[]`
3. `@geolocus/core` 执行空间推理
4. 输出：模糊区域多边形、概率网格、代表性点
5. 前端在 MapBox GL 上可视化结果

## 架构详情

### Core 包 (`package/core/src/`)

- `context/` - GeolocusContext 管理状态、角色、对象映射、空间参考
- `relation/` - 空间关系计算（方向、距离、拓扑）
- `region/` - 模糊区域计算、概率分布（PDF）、A\* 路径
- `object/` - GeolocusObject 和几何体处理
- `io/` - GeoJSON 转换

### Client 包 (`package/client/src/`)

- `page/chat/Chat.tsx` - 主聊天和地图交互
- `util/deepseek.util.ts` - LLM 集成和提示词工程
- `util/geolocus.util.ts` - Core 库封装
- `util/place.plugin.ts` - 地名解析插件
- 使用 Zustand 进行状态管理，路径别名 `@/` → `src/`

### MCP Server (`package/mcp-server/src/`)

- `tools/` - MCP 工具实现（parse_geo_text、compute_fuzzy_location）
- `config.ts` - 配置，包括地名目录
- 支持 stdio 和 HTTP 两种传输模式

## 代码规范

- **提交**: Conventional Commits 格式（commitlint 强制执行）
- **检查**: ESLint，max-warnings 0（严格模式）
- **格式化**: Prettier - 2空格缩进、无分号、单引号、80字符宽度
- **TypeScript**: 严格模式，ES2020 目标
- **路径别名**: `@/` 映射到各包的 `src/`

## 测试

- 框架: Vitest
- 测试文件: `*.test.ts` 模式
- 覆盖率排除: `/type/` 目录和 `index.ts` 文件
