import { execaSync } from 'execa'
import path from 'path'
import fs, { rmSync } from 'fs'

const dirName = import.meta.dirname

// ts to js
execaSync('node', ['./esbuild.config.js'])
console.log('ts to js finished.')

// generate .d.ts
execaSync('tsc', ['-p', 'tsconfig.build.json'])
console.log('generate .d.ts finished')

// merge .d.ts
const mergeTs = (dir) => {
  let mergedContent = ''

  const dfs = (dir) => {
    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        dfs(filePath)
      } else if (path.extname(file) === '.ts' && !file.includes('index')) {
        let content = fs.readFileSync(filePath, 'utf-8')
        content = content.replace(/import.+/g, '')
        content = content.replace(/export declare const/g, 'const')
        mergedContent += content + '\n'
      }
    })
  }

  dfs(dir)

  mergedContent = mergedContent.replace(/export {};/g, '')

  const filePath = path.join(dir, 'index.d.ts')
  let content = fs.readFileSync(filePath, 'utf-8')
  content = content.replace(/import\(.*?\)\./g, '')
  content = content.replace(/import.+/g, '')

  let res = ''
  res += "import jsts from '@geolocus/jsts';\n"
  res += "import { GeoJSON } from 'geojson';\n"
  res += mergedContent
  res += content

  res = res.replace(/^\s*[\r\n]/gm, '')

  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      rmSync(filePath, {
        force: true,
        recursive: true,
      })
    }
  })

  return res
}

const mergedContent = mergeTs(path.join(dirName, 'dist'))
fs.writeFileSync(path.join(dirName, 'dist', 'index.d.ts'), mergedContent)
console.log('merge .d.ts finished')
