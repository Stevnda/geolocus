# Geolocus

## Statistics

### Lines of Code

```bash
# All code
cloc xxx
# Exclude test code
cloc --not-match-f='.*test.ts' xxx
```

## Startup Guide

### Core Startup

The packages need to be built in order.

```bash
# Build the concave package
pnpm -C package/concave install
pnpm -C package/concave build

# Build the core package
pnpm -C package/core install
pnpm -C package/core build
```

After the core is ready, run this in the repository root:

```bash
pnpm install
```

### MCP Server Startup

Copy and fill in the config file:

```powershell
cd package/mcp-server
Copy-Item config.example.json config.json
```

Start command:

```bash
pnpm -C package/mcp-server dev:http
```

### Agent Server Startup

Copy and fill in the config file:

```powershell
cd package/agent-server
Copy-Item config.example.json config.json
```

Key fields:

- `deepseek.apiKey`: must be set to a real API key
- `mcp.baseUrl`: defaults to `http://127.0.0.1:3000/mcp`
- `results.allowedDir`: defaults to `package/mcp-server/temp-files` (allowlist for reading result files)

Start command:

```bash
pnpm -C package/agent-server dev
```

### Client Startup

```bash
pnpm -C package/client dev
```

### Screenshot Platform Startup

For paper figures only:

```bash
pnpm --dir package/json2map dev
```
