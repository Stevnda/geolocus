import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { AgentServerConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

function minimalPng(): Buffer {
  // PNG signature only; good enough for transport tests.
  return Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
}

describe('results api', () => {
  let cfg: AgentServerConfig
  let baseUrl: string
  let server: import('node:http').Server

  beforeAll(async () => {
    const allowedDir = await mkdtemp(
      path.join(os.tmpdir(), 'geolocus-results-'),
    )

    const id = 'r1'
    const resultsDir = path.join(allowedDir, id)
    const gridsDir = path.join(resultsDir, 'grids')
    await mkdir(gridsDir, { recursive: true })

    await writeFile(path.join(gridsDir, '0.png'), minimalPng())
    await writeFile(path.join(gridsDir, 'region.png'), minimalPng())

    const meta = {
      version: 1,
      createdAt: new Date().toISOString(),
      geometryType: 'point',
      target: 'x',
      triples: [],
      bbox: [0, 0, 1, 1],
      center: [0.5, 0.5],
      resultGeoJSON: { type: 'FeatureCollection', features: [] },
      regionGeoJSON: { type: 'FeatureCollection', features: [] },
      regionPdfGridPath: 'grids/region.png',
      regionPdfGridBbox: [0, 0, 1, 1],
      tripleResults: [
        {
          coord: [0.5, 0.5],
          regionGeoJSON: { type: 'FeatureCollection', features: [] },
          pdfGridPath: 'grids/0.png',
          pdfGridBbox: [0, 0, 1, 1],
        },
      ],
    }
    await writeFile(
      path.join(resultsDir, 'meta.json'),
      JSON.stringify(meta),
      'utf8',
    )

    cfg = {
      http: { host: '127.0.0.1', port: 0 },
      deepseek: { apiKey: 'x', baseUrl: 'x', model: 'x', timeoutMs: 1000 },
      mcp: { baseUrl: 'http://127.0.0.1:1/mcp' },
      results: { allowedDir },
    }

    const app = createApp({ cfg })
    server = app.listen(0)
    await new Promise<void>((resolve) =>
      server.once('listening', () => resolve()),
    )
    const addr = server.address()
    if (!addr || typeof addr === 'string')
      throw new Error('unexpected_listen_address')
    baseUrl = `http://127.0.0.1:${addr.port}`
  })

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    )
  })

  it('serves summary', async () => {
    const res = await fetch(`${baseUrl}/api/results/r1/summary`)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.geometryType).toBe('point')
    expect(json.tripleCount).toBe(1)
  })

  it('serves geojson', async () => {
    const res = await fetch(`${baseUrl}/api/results/r1/geojson`)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('resultGeoJSON')
    expect(json).toHaveProperty('regionGeoJSON')
  })

  it('serves triples', async () => {
    const res = await fetch(`${baseUrl}/api/results/r1/triples`)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(1)
    expect(json[0].pdfGridPath).toBe('grids/0.png')
  })

  it('serves region png for point results', async () => {
    const res = await fetch(`${baseUrl}/api/results/r1/grids/region.png`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('image/png')
    const buf = Buffer.from(await res.arrayBuffer())
    expect(buf.length).toBeGreaterThan(0)
  })

  it('serves indexed png', async () => {
    const res = await fetch(`${baseUrl}/api/results/r1/grids/0.png`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('image/png')
  })
})
