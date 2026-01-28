# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Geolocus is a spatial reasoning system that converts natural language geographic descriptions into precise spatial coordinates and regions. It parses user input into "spatial triples" (origin → relation → target), then computes fuzzy location areas, probability grids, and representative points.

## Monorepo Structure

```
package/
├── core/       - Spatial reasoning engine (TypeScript library)
├── client/     - React web application (Vite, MapBox GL, ECharts)
├── mcp-server/ - Model Context Protocol server (DeepSeek LLM integration)
├── jsts/       - JavaScript Topology Suite wrapper
└── concave/    - Concave hull computation wrapper
```

**Dependency flow**: `client` → `core` → `jsts`, `concave`; `mcp-server` → `core`

## Common Commands

```bash
# Install dependencies
pnpm install

# Root-level commands
pnpm lint              # Lint all packages (max-warnings 0)
pnpm format            # Prettier + lint
pnpm test              # Run all tests
pnpm test:coverage     # Tests with coverage

# Client (React frontend, port 5678)
pnpm -C package/client dev
pnpm -C package/client build
pnpm -C package/client test

# Core (spatial reasoning library)
pnpm -C package/core build
pnpm -C package/core test

# MCP Server
pnpm -C package/mcp-server dev        # stdio mode
pnpm -C package/mcp-server dev:http   # HTTP mode
pnpm -C package/mcp-server build

# Run single test file
pnpm -C package/core test src/region/region.test.ts
```

## Core Concepts

### UserGeolocusTriple

The central data structure representing spatial relationships:

```typescript
interface UserGeolocusTriple {
  role: string                    // Perspective/observer role
  tupleList: {
    originList?: OriginOrTriple[] // Reference points/geometries
    relation?: {
      topology?: 'disjoint' | 'contain' | 'within' | 'intersect' | 'along' | 'toward'
      direction?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'F' | 'R' | 'B' | 'L' | ...
      distance?: number | [min, max] | 'VN' | 'N' | 'M' | 'F' | 'VF'
      range?: 'inside' | 'outside' | 'both'
    }
  }[]
  target: string                  // Place name to locate
}
```

### Workflow

1. User inputs geographic description (Chinese natural language)
2. LLM (DeepSeek) converts text → `UserGeolocusTriple[]`
3. `@geolocus/core` performs spatial reasoning
4. Outputs: fuzzy region polygon, probability grid, representative points
5. Frontend visualizes results on MapBox GL

## Architecture Details

### Core Package (`package/core/src/`)

- `context/` - GeolocusContext manages state, roles, object maps, spatial references
- `relation/` - Spatial relation computations (direction, distance, topology)
- `region/` - Fuzzy region computation, probability distribution (PDF), A\* path
- `object/` - GeolocusObject and geometry handling
- `io/` - GeoJSON conversion

### Client Package (`package/client/src/`)

- `page/chat/Chat.tsx` - Main chat and map interaction
- `util/deepseek.util.ts` - LLM integration and prompt engineering
- `util/geolocus.util.ts` - Core library wrapper
- `util/place.plugin.ts` - Place name resolution plugin
- Uses Zustand for state management, path alias `@/` → `src/`

### MCP Server (`package/mcp-server/src/`)

- `tools/` - MCP tool implementations (parse_geo_text, compute_fuzzy_location)
- `config.ts` - Configuration including place catalog
- Supports both stdio and HTTP transport modes

## Code Style

- **Commits**: Conventional Commits format (enforced by commitlint)
- **Linting**: ESLint with max-warnings 0 (strict mode)
- **Formatting**: Prettier - 2-space indent, no semicolons, single quotes, 80-char width
- **TypeScript**: Strict mode, ES2020 target
- **Path aliases**: `@/` maps to `src/` in packages with Vite

## Testing

- Framework: Vitest
- Test files: `*.test.ts` pattern
- Coverage excludes: `/type/` directories and `index.ts` files
