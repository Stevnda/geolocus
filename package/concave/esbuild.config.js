import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'browser',
  outdir: 'dist',
  sourcemap: true,
  format: 'esm',
  minify: true,
  target: 'ES2020',
})
