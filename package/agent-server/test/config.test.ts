import { describe, expect, it } from 'vitest'
import { parseConfig } from '../src/config.js'

describe('config', () => {
  it('rejects missing required fields', () => {
    expect(() =>
      parseConfig({
        http: { host: '127.0.0.1', port: 8080 },
      }),
    ).toThrow()
  })

  it('accepts minimal valid config', () => {
    const cfg = parseConfig({
      http: { host: '127.0.0.1', port: 8080 },
      deepseek: {
        apiKey: 'x',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        timeoutMs: 60000,
      },
      mcp: { baseUrl: 'http://127.0.0.1:3000/mcp' },
      results: { allowedDir: 'package/mcp-server/temp-files' },
    })
    expect(cfg.deepseek.apiKey).toBe('x')
  })
})
