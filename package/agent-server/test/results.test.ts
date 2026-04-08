import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveResultsDir } from '../src/results.js'

describe('results', () => {
  it('rejects path traversal ids', async () => {
    await expect(
      resolveResultsDir({
        allowedDir: 'package/mcp-server/temp-files',
        id: '../x',
      }),
    ).rejects.toThrow('invalid_result_id')
  })

  it('resolves a directory under allowedDir', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'geolocus-agent-'))
    const resultsDir = path.join(dir, 'a')
    await mkdir(resultsDir, { recursive: true })
    await writeFile(path.join(resultsDir, 'meta.json'), '{"ok":true}', 'utf8')

    const resolved = await resolveResultsDir({ allowedDir: dir, id: 'a' })
    expect(resolved.dirPath).toBe(resultsDir)
  })
})
