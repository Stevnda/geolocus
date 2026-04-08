import { deepseekTextToJsonArray } from '../../deepseek/deepseek.js'
import type { UserGeolocusTriple } from '../../geolocus/userGeolocusTriple.js'
import { llmTripleArraySchema, type LlmTriple } from './tripleSchemas.js'

export type ParseGeoTextOk = { ok: true; data: UserGeolocusTriple[] }
export type ParseGeoTextErr = {
  ok: false
  error: string
  rawText?: string
  details?: { targets?: string[] }
}
export type ParseGeoTextResult = ParseGeoTextOk | ParseGeoTextErr

function normalizeTriple(triple: LlmTriple): UserGeolocusTriple {
  return {
    role: triple.role || 'default',
    target: triple.target,
    tupleList: triple.tupleList.map((tuple) => {
      const originList = tuple.originList?.map((item) => {
        if ('target' in item) return normalizeTriple(item)
        return item
      })
      return {
        originList,
        relation: tuple.relation,
      }
    }),
  }
}

export async function parseGeoText(text: string): Promise<ParseGeoTextResult> {
  const llm = await deepseekTextToJsonArray(text)
  if (!llm.ok) return { ok: false, error: llm.error }

  const rawText = llm.content

  try {
    const parsed = JSON.parse(rawText)
    const validated = llmTripleArraySchema.safeParse(parsed)
    if (!validated.success) {
      return {
        ok: false,
        error: 'invalid_triples',
        rawText,
      }
    }

    const targets = Array.from(new Set(validated.data.map((t) => t.target)))
    if (targets.length !== 1) {
      return {
        ok: false,
        error: 'multiple_targets',
        rawText,
        details: { targets },
      }
    }

    return { ok: true, data: validated.data.map(normalizeTriple) }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `invalid_json: ${message}`, rawText }
  }
}
