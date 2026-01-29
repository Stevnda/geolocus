import path from 'node:path'
import { realpath } from 'node:fs/promises'
import { resolveFromRepo } from './config.js'

export function toSafeResultsId(filePath: string): string {
  // Persist the "id" as filename only; avoids leaking absolute paths to clients.
  return path.basename(filePath)
}

export async function resolveResultsFile(params: {
  allowedDir: string
  id: string
}): Promise<{ allowedDirReal: string; fileReal: string; filePath: string }> {
  const id = params.id
  // Fast-path checks before filesystem calls.
  // 只允许“文件名”作为 id，拒绝任何路径分隔符/相对路径，避免路径穿越。
  if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
    throw new Error('invalid_result_id')
  }

  const allowedDirAbs = resolveFromRepo(params.allowedDir)
  const filePath = path.join(allowedDirAbs, id)

  // realpath 能解析符号链接；配合 startsWith 校验，防止“链接跳出 allowDir”。
  const [allowedDirReal, fileReal] = await Promise.all([
    realpath(allowedDirAbs),
    realpath(filePath),
  ])

  const normalizedAllowed = allowedDirReal.endsWith(path.sep)
    ? allowedDirReal
    : allowedDirReal + path.sep

  if (!fileReal.startsWith(normalizedAllowed)) {
    throw new Error('result_id_outside_allowed_dir')
  }

  return { allowedDirReal, fileReal, filePath }
}
