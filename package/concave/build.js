import { execaSync } from 'execa'

// ts to js
const jsCmd = 'node ./esbuild.config.js'
execaSync(jsCmd)
console.log('ts to js finished.')

// generate .d.ts
const typeCmd = `tsc -p tsconfig.build.json`
execaSync(typeCmd)
console.log('generate .d.ts finished')
