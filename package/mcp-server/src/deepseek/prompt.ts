import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export async function loadGeoTriplePrompt(): Promise<string> {
  const promptPath = fileURLToPath(new URL('../../prompt.txt', import.meta.url))
  return readFile(promptPath, 'utf8')
}
