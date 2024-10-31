import { geolocus, GeolocusGird, UserGeolocusTriple } from '@geolocus/core'
import { getPlaceDataByName } from './place.plugin'

export const temp = [
  {
    role: 'default',
    origin: {
      name: '吉隆坡机场',
    },
  },
  {
    role: 'default',
    origin: {
      name: '马六甲海峡',
    },
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
  },
  {
    role: 'default',
    origin: {
      name: '卡里马塔海峡',
    },
  },
  {
    role: 'default',
    origin: {
      name: '九段线',
    },
    relation: {
      direction: 'S',
      topology: 'disjoint',
      distance: 400000,
    },
  },
  {
    role: 'default',
    origin: {
      name: '加里曼尼岛',
    },
  },
  {
    role: 'default',
    origin: {
      name: '苏拉威西海',
    },
    relation: {
      direction: 'SE',
      topology: 'contain',
    },
  },
  {
    role: 'default',
    origin: {
      name: '菲律宾',
    },
    relation: {
      direction: 'E',
      topology: 'disjoint',
      distance: 100000,
    },
  },
  {
    role: 'default',
    origin: {
      name: '巴士海峡',
    },
    relation: {
      direction: 'W',
      topology: 'disjoint',
      distance: 150000,
    },
  },
  {
    role: 'default',
    origin: {
      name: '台湾',
    },
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
  },
  {
    role: 'default',
    origin: {
      name: '松山机场',
    },
  },
]

export const geolocusContext = geolocus.createContext({
  maxDistance: 1000000,
  name: 'test',
  gridSize: 128 * 128,
})

geolocusContext.addRole({
  name: 'default',
  directionDelta: Math.PI / 4,
  distanceDelta: 0.2,
  orientation: 0,
  semanticDistanceMap: {
    VN: [0, 10000],
    N: [10000, 30000],
    M: [30000, 100000],
    F: [100000, 300000],
    VF: [300000, 2000000],
  },
  weight: 1,
})

geolocusContext.use('place', getPlaceDataByName)

export const computePointTest = (text: string) => {
  const tripleList = JSON.parse(text) as UserGeolocusTriple[]
  geolocusContext.defineRelation(tripleList)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  geolocusContext.computeFuzzyPointObject(tripleList[0].target!)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return geolocusContext.getComputeResult(tripleList[0].target!)
}

export const computeLineTest = (text: string) => {
  const tripleList = JSON.parse(text) as UserGeolocusTriple[]
  const res = geolocusContext.computeFuzzyLineObject('taiwan', tripleList)
  console.log(res)
  return res
}

function getColorFromRainbow(value: number) {
  value = value + 0.1
  // 定义彩虹色带的RGB颜色值
  const colors = [
    [75, 0, 130], // 靛蓝
    [0, 0, 255], // 蓝色
    [0, 255, 0], // 绿色
    [255, 255, 0], // 黄色
    [255, 127, 0], // 橙色
    [255, 64, 0], // 红色
    [255, 0, 0], // 红色
  ]

  // 计算value在色带中的位置
  const index = Math.floor(value * (colors.length - 2))
  const fraction = value * (colors.length - 2) - index

  // 获取当前颜色和下一个颜色
  const color1 = colors[index]
  const color2 = colors[index + 1]

  // 线性插值计算最终颜色
  const r = Math.round(color1[0] + fraction * (color2[0] - color1[0]))
  const g = Math.round(color1[1] + fraction * (color2[1] - color1[1]))
  const b = Math.round(color1[2] + fraction * (color2[2] - color1[2]))

  return [r, g, b]
}

export const generateBlobPng = (matrix: GeolocusGird) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const m = matrix.length
  const n = matrix[0].length

  canvas.width = n
  canvas.height = m

  const imageData = ctx.createImageData(n, m)
  const data = imageData.data

  // 根据数组值大小赋值蓝到红
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const value = matrix[i][j]
      const index = (i * n + j) * 4
      const [r, g, b] = getColorFromRainbow(value)

      // 根据值大小赋值颜色
      data[index] = r // R
      data[index + 1] = g // G
      data[index + 2] = b // B
      data[index + 3] = value < Number.EPSILON ? 0 : 255 // A
    }
  }

  // 将图像数据写入 canvas
  ctx.putImageData(imageData, 0, 0)

  // 将 canvas 转换为 Data URL
  const dataUrl = canvas.toDataURL('image/png')

  // 将 Data URL 转换为 Blob 对象
  const byteString = atob(dataUrl.split(',')[1])
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}
