# Geolocus

## 统计

### 代码行数

```bash
# 所有代码
cloc xxx
# 移除测试代码
cloc --not-match-f='.*test.ts' xxx
```


## 启动流程

### 内核启动
需要按顺序进行编译
```bash

#编译concave包
pnpm -C package/concave install
pnpm -C package/concave build

#编译core包
pnpm -C package/core install
pnpm -C package/core build
```
内核启动后，根路径下：
```bash
pnpm install
```

### MCP-server启动
复制并填写配置文件：

```powershell
cd package/mcp-server
Copy-Item config.example.json config.json
```
启动命令：
```bash
pnpm -C package/mcp-server dev:http
```

### agent-server启动
复制并填写配置文件：

```powershell
cd package/agent-server
Copy-Item config.example.json config.json
```

关键字段：

- `deepseek.apiKey`：必须填写真实 key
- `mcp.baseUrl`：默认 `http://127.0.0.1:3000/mcp`
- `results.allowedDir`：默认 `package/mcp-server/temp-files`（结果文件读取 allowlist）

启动命令：
```bash
pnpm -C package/agent-server dev
```

### client启动
```bash
pnpm -C package/client dev
```
