import { loadGeoTriplePrompt } from './prompt.js'
import { loadConfig } from '../config.js'

type DeepseekChatMessage = { role: 'system' | 'user'; content: string }

type DeepseekChatCompletionRequest = {
  model: string
  messages: DeepseekChatMessage[]
  temperature?: number
  stream?: boolean
}

type DeepseekChatCompletionResponse = {
  choices: Array<{
    message?: { content?: string }
  }>
}

export type DeepseekCallOk = { ok: true; content: string }
export type DeepseekCallErr = { ok: false; error: string }
export type DeepseekCallResult = DeepseekCallOk | DeepseekCallErr

export async function deepseekTextToJsonArray(
  text: string,
): Promise<DeepseekCallResult> {
  let cfg
  try {
    cfg = await loadConfig()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }

  const prompt = await loadGeoTriplePrompt()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), cfg.deepseek.timeoutMs)
  try {
    const body: DeepseekChatCompletionRequest = {
      model: cfg.deepseek.model,
      temperature: 0,
      stream: false,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
    }

    const res = await fetch(`${cfg.deepseek.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cfg.deepseek.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return {
        ok: false,
        error: `Deepseek HTTP ${res.status}: ${errText || res.statusText}`,
      }
    }

    const json: DeepseekChatCompletionResponse = await res.json()
    const content = json.choices?.[0]?.message?.content
    if (!content)
      return { ok: false, error: 'Deepseek response missing content' }
    return { ok: true, content }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    clearTimeout(timeout)
  }
}
