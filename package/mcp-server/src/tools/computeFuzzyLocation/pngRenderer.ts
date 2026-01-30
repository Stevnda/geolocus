import sharp from 'sharp'

function getColorFromRainbow(value: number): [number, number, number] {
  value = value + 0.1
  const colors: Array<[number, number, number]> = [
    [75, 0, 130], // indigo
    [0, 0, 255], // blue
    [0, 255, 0], // green
    [255, 255, 0], // yellow
    [255, 127, 0], // orange
    [255, 64, 0], // red-ish
    [255, 0, 0], // red
  ]

  const index = Math.floor(value * (colors.length - 2))
  const fraction = value * (colors.length - 2) - index

  const color1 = colors[index] ?? colors[0]
  const color2 = colors[index + 1] ?? colors[colors.length - 1]

  const r = Math.round(color1[0] + fraction * (color2[0] - color1[0]))
  const g = Math.round(color1[1] + fraction * (color2[1] - color1[1]))
  const b = Math.round(color1[2] + fraction * (color2[2] - color1[2]))

  return [r, g, b]
}

export async function renderGridToPng(
  grid: number[][],
  min = 0.05,
): Promise<Buffer> {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  if (height <= 0 || width <= 0) throw new Error('invalid_grid')

  const rgba = Buffer.allocUnsafe(width * height * 4)
  let offset = 0

  for (let row = 0; row < height; row++) {
    const rowData = grid[row]
    if (!rowData || rowData.length !== width) throw new Error('invalid_grid')
    for (let col = 0; col < width; col++) {
      const value = rowData[col] ?? 0
      const [r, g, b] = getColorFromRainbow(value)
      rgba[offset] = r
      rgba[offset + 1] = g
      rgba[offset + 2] = b
      rgba[offset + 3] = value < min ? 0 : 255
      offset += 4
    }
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer()
}
