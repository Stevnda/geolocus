import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..', '..')

const DEFAULT_SOURCE_TS = path.resolve(
  repoRoot,
  'package/core/test/util/place.plugin.ts',
)

const DEFAULT_OUTPUT_FILES = [
  path.resolve(repoRoot, 'package/mcp-server/place-catalog.json'),
  path.resolve(repoRoot, 'package/mcp-server/place-catalog.example.json'),
]

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return null
  const val = process.argv[idx + 1]
  if (!val || val.startsWith('-')) {
    throw new Error(`Missing value for ${flag}`)
  }
  return val
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function findPlaceDataBaseInitializer(sourceFile) {
  /** @type {import('typescript').Expression | null} */
  let found = null

  /** @param {import('typescript').Node} node */
  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const name = node.name
      if (ts.isIdentifier(name) && name.text === 'placeDataBase') {
        if (!node.initializer) {
          throw new Error('placeDataBase has no initializer')
        }
        found = node.initializer
        return
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

function evalObjectExpression(expressionText) {
  const wrapped = `(${expressionText})`
  return vm.runInNewContext(wrapped, {}, { timeout: 1000 })
}

function buildPlaceCatalog(placeDataBase) {
  const features = placeDataBase?.features
  if (!Array.isArray(features)) {
    throw new Error('placeDataBase.features is not an array')
  }

  const allowedTypes = new Set([
    'Point',
    'LineString',
    'Polygon',
    'MultiPoint',
    'MultiLineString',
    'MultiPolygon',
  ])

  /** @type {Record<string, { type: string, coord: unknown }>} */
  const out = {}
  /** @type {string[]} */
  const duplicates = []

  for (const feature of features) {
    const name = feature?.properties?.name
    if (!name || typeof name !== 'string') continue

    const type = feature?.geometry?.type
    const coord = feature?.geometry?.coordinates

    if (!allowedTypes.has(type)) {
      throw new Error(
        `Unexpected geometry type for "${name}": ${JSON.stringify(type)}`,
      )
    }
    if (coord === undefined) {
      throw new Error(`Missing geometry.coordinates for "${name}"`)
    }

    if (out[name]) duplicates.push(name)
    out[name] = { type, coord }
  }

  return { out, duplicates }
}

async function main() {
  const sourceTs = getArgValue('--src') ?? DEFAULT_SOURCE_TS
  const outFileArgs = []

  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--out') {
      const val = process.argv[i + 1]
      if (!val || val.startsWith('-'))
        throw new Error('Missing value for --out')
      outFileArgs.push(path.resolve(process.cwd(), val))
      i++
    }
  }

  const outFiles = outFileArgs.length ? outFileArgs : DEFAULT_OUTPUT_FILES
  const quiet = hasFlag('--quiet')

  const sourceText = await readFile(sourceTs, 'utf8')
  const sourceFile = ts.createSourceFile(
    sourceTs,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const initializer = findPlaceDataBaseInitializer(sourceFile)
  if (!initializer) {
    throw new Error('Failed to find placeDataBase in source file')
  }

  const placeDataBase = evalObjectExpression(initializer.getText(sourceFile))
  const { out, duplicates } = buildPlaceCatalog(placeDataBase)

  const json = JSON.stringify(out, null, 2) + '\n'
  await Promise.all(outFiles.map((file) => writeFile(file, json, 'utf8')))

  if (!quiet) {
    process.stdout.write(`Wrote ${Object.keys(out).length} places:\n`)
    for (const file of outFiles)
      process.stdout.write(`- ${path.relative(repoRoot, file)}\n`)
    if (duplicates.length) {
      process.stderr.write(
        `Duplicate names overwritten (${duplicates.length}): ${duplicates.join(', ')}\n`,
      )
    }
  }
}

main().catch((err) => {
  const message =
    err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  process.stderr.write(message + '\n')
  process.exitCode = 1
})
