import express, { type Request, type Response } from 'express'
import { z } from 'zod'

import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModel,
  type UIMessage,
} from 'ai'

import type { AgentServerConfig } from './config.js'
import {
  readMetaJson,
  readPngFile,
  resolveResultsDir,
  toSafeResultsId,
} from './results.js'

const chatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
})

function jsonBody(limit: string) {
  return express.json({ limit })
}

function badRequest(res: Response, error: string) {
  return res.status(400).json({ error })
}

export function createApp(params: {
  cfg: AgentServerConfig
  chat?: {
    system: string
    model: (modelId: string) => LanguageModel
    mcpTools: Record<string, unknown>
  }
}) {
  const { cfg, chat } = params

  const app = express()
  app.use(jsonBody('2mb'))

  app.get('/healthz', (_req, res) => res.json({ ok: true }))

  if (chat) {
    app.post('/api/chat', async (req: Request, res: Response) => {
      let body: unknown
      try {
        body = req.body
      } catch {
        return badRequest(res, 'invalid_json')
      }

      const parsed = chatRequestSchema.safeParse(body)
      if (!parsed.success) return badRequest(res, 'bad_request')

      const result = streamText({
        model: chat.model(cfg.deepseek.model),
        system: chat.system,
        messages: await convertToModelMessages(parsed.data.messages),
        stopWhen: stepCountIs(8),
        tools: {
          ...chat.mcpTools,
          to_results_id: {
            description:
              'Convert an MCP compute_fuzzy_location filePath into resultsId (basename).',
            inputSchema: z.object({ filePath: z.string().min(1) }),
            execute: async ({ filePath }: { filePath: string }) =>
              toSafeResultsId(filePath),
          },
        },
      })

      result.pipeUIMessageStreamToResponse(res)
    })
  }

  app.get('/api/results/:id/summary', async (req: Request, res: Response) => {
    const id = String(req.params.id || '')
    try {
      const resolved = await resolveResultsDir({
        allowedDir: cfg.results.allowedDir,
        id,
      })
      const meta = await readMetaJson(resolved.dirPath)

      res.setHeader('content-type', 'application/json; charset=utf-8')
      return res.status(200).send(
        JSON.stringify(
          {
            version: meta.version,
            createdAt: meta.createdAt,
            geometryType: meta.geometryType,
            target: meta.target,
            tripleCount: meta.tripleResults?.length ?? 0,
            bbox: meta.bbox ?? null,
            center: meta.center ?? null,
          },
          null,
          2,
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (
        message === 'invalid_result_id' ||
        message === 'result_id_outside_allowed_dir'
      ) {
        return badRequest(res, message)
      }
      return res.status(404).json({ error: 'not_found' })
    }
  })

  app.get('/api/results/:id/geojson', async (req: Request, res: Response) => {
    const id = String(req.params.id || '')
    try {
      const resolved = await resolveResultsDir({
        allowedDir: cfg.results.allowedDir,
        id,
      })
      const meta = await readMetaJson(resolved.dirPath)
      res.setHeader('content-type', 'application/json; charset=utf-8')
      return res.status(200).send(
        JSON.stringify(
          {
            resultGeoJSON: meta.resultGeoJSON,
            regionGeoJSON: meta.regionGeoJSON,
          },
          null,
          2,
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (
        message === 'invalid_result_id' ||
        message === 'result_id_outside_allowed_dir'
      ) {
        return badRequest(res, message)
      }
      return res.status(404).json({ error: 'not_found' })
    }
  })

  app.get('/api/results/:id/triples', async (req: Request, res: Response) => {
    const id = String(req.params.id || '')
    try {
      const resolved = await resolveResultsDir({
        allowedDir: cfg.results.allowedDir,
        id,
      })
      const meta = await readMetaJson(resolved.dirPath)
      res.setHeader('content-type', 'application/json; charset=utf-8')
      return res
        .status(200)
        .send(JSON.stringify(meta.tripleResults ?? [], null, 2))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (
        message === 'invalid_result_id' ||
        message === 'result_id_outside_allowed_dir'
      ) {
        return badRequest(res, message)
      }
      return res.status(404).json({ error: 'not_found' })
    }
  })

  app.get(
    '/api/results/:id/grids/region.png',
    async (req: Request, res: Response) => {
      const id = String(req.params.id || '')
      try {
        const resolved = await resolveResultsDir({
          allowedDir: cfg.results.allowedDir,
          id,
        })
        const meta = await readMetaJson(resolved.dirPath)
        if (meta.geometryType !== 'point' || !meta.regionPdfGridPath) {
          return res.status(404).json({ error: 'not_found' })
        }
        const png = await readPngFile({
          resultsDir: resolved.dirPath,
          relPath: meta.regionPdfGridPath,
        })
        res.setHeader('content-type', 'image/png')
        return res.status(200).send(png)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (
          message === 'invalid_result_id' ||
          message === 'result_id_outside_allowed_dir'
        ) {
          return badRequest(res, message)
        }
        return res.status(404).json({ error: 'not_found' })
      }
    },
  )

  app.get(
    '/api/results/:id/grids/:index.png',
    async (req: Request, res: Response) => {
      const id = String(req.params.id || '')
      const index = Number(req.params.index)
      if (!Number.isInteger(index) || index < 0)
        return badRequest(res, 'invalid_index')

      try {
        const resolved = await resolveResultsDir({
          allowedDir: cfg.results.allowedDir,
          id,
        })
        const meta = await readMetaJson(resolved.dirPath)
        const item = meta.tripleResults?.[index]
        if (!item?.pdfGridPath)
          return res.status(404).json({ error: 'not_found' })

        const png = await readPngFile({
          resultsDir: resolved.dirPath,
          relPath: item.pdfGridPath,
        })
        res.setHeader('content-type', 'image/png')
        return res.status(200).send(png)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (
          message === 'invalid_result_id' ||
          message === 'result_id_outside_allowed_dir'
        ) {
          return badRequest(res, message)
        }
        return res.status(404).json({ error: 'not_found' })
      }
    },
  )

  return app
}
