import { describe, expect, it } from 'vitest'
import sharp from 'sharp'

import { renderGridToPng } from '../src/tools/computeFuzzyLocation/pngRenderer.js'

describe('renderGridToPng', () => {
  it('renders a valid png with transparency threshold', async () => {
    const grid = [
      [0.0, 0.1],
      [0.04, 0.9],
    ]

    const png = await renderGridToPng(grid, 0.05)

    const meta = await sharp(png).metadata()
    expect(meta.format).toBe('png')
    expect(meta.width).toBe(2)
    expect(meta.height).toBe(2)

    const raw = await sharp(png).raw().toBuffer()
    // raw order is RGBA, row-major
    const alpha00 = raw[3]
    const alpha01 = raw[7]
    const alpha10 = raw[11]
    const alpha11 = raw[15]

    expect(alpha00).toBe(0)
    expect(alpha01).toBe(255)
    expect(alpha10).toBe(0)
    expect(alpha11).toBe(255)
  })
})
