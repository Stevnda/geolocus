import { describe, expect, it } from 'vitest'
import { computeFuzzyLocationResultSchema } from '../src/mcp.js'

describe('mcp result shapes', () => {
  it('accepts compute_fuzzy_location error shape', () => {
    const parsed = computeFuzzyLocationResultSchema.parse({
      ok: false,
      error: 'unresolved_origins',
      details: {
        unresolvedOriginNames: ['x'],
        unresolvedOriginNamesTruncated: false,
      },
    })
    expect(parsed.ok).toBe(false)
  })
})
