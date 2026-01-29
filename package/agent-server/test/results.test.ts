import { mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveResultsFile } from '../src/results.js'

describe('results', () => {
  it('rejects path traversal ids', async () => {
    await expect(
      resolveResultsFile({
        allowedDir: 'package/mcp-server/temp-files',
        id: '../x',
      }),
    ).rejects.toThrow('invalid_result_id')
  })

  it('resolves a file under allowedDir', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'geolocus-agent-'))
    const file = path.join(dir, 'a.json')
    await writeFile(file, '{"ok":true}', 'utf8')

    const resolved = await resolveResultsFile({ allowedDir: dir, id: 'a.json' })
    expect(resolved.filePath).toBe(file)
  })
})
