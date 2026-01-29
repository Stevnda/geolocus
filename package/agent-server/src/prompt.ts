import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

let cachedPrompt: string | null = null

export async function loadSystemPrompt(): Promise<string> {
  // Loaded once per process to avoid per-request filesystem reads.
  if (cachedPrompt) return cachedPrompt
  const promptPath = fileURLToPath(
    new URL('./system-prompt.txt', import.meta.url),
  )
  cachedPrompt = await readFile(promptPath, 'utf8')
  return cachedPrompt
}
