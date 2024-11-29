/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { Button } from 'antd'
import { useTextStore } from '@/store/textStore'
import {
  computeLineTest,
  computePointTest,
  computePolygonTest,
  generateBlobPng,
  geolocusContext,
} from '@/util/geolocus.util'
import { toWgs84 } from '@turf/projection'
import {
  addGeoJSONToMap,
  addImageToMap,
  convertToWgs84,
  removeMapLayer,
  removeMapSource,
} from '@/util/mapbox.util'
import { useMapStore } from '@/store/mapStore'
import { GeolocusGrid, GeolocusObject, Position2 } from '@geolocus/core'
import { useLayerStore } from '@/store/layerStore'
import { generatePointByCoord } from '@/util/geojson.util'

const text = [
  {
    role: 'default',
    originList: [
      {
        name: '吉隆坡机场',
      },
    ],
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '马六甲海峡',
      },
    ],
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '卡里马塔海峡',
      },
    ],
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '九段线',
      },
    ],
    relation: {
      direction: 'S',
      topology: 'disjoint',
      distance: 400000,
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '加里曼尼岛',
      },
    ],
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '苏拉威西海',
      },
    ],
    relation: {
      direction: 'SE',
      topology: 'contain',
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '菲律宾',
      },
    ],
    relation: {
      direction: 'E',
      topology: 'along',
      distance: 100000,
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '巴士海峡',
      },
    ],
    relation: {
      direction: 'W',
      topology: 'disjoint',
      distance: 150000,
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '台湾',
      },
    ],
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '松山机场',
      },
    ],
    target: 'taiwan',
  },
  {
    role: 'default',
    relation: {
      topology: 'disjoint',
      direction: 'N',
      distance: 800000,
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    relation: {
      topology: 'disjoint',
      direction: 'NE',
      distance: 300000,
    },
    target: 'taiwan',
  },
  {
    role: 'default',
    originList: [
      {
        name: '首尔',
      },
    ],
    target: 'taiwan',
  },
]

export const JsonText = () => {
  const textRef = useRef<null>(null)
  const jsonText = useTextStore((state) => state.jsonText)
  const setJsonText = useTextStore((state) => state.setJsonText)
  const map = useMapStore((state) => state.map)
  const addLayer = useLayerStore((state) => state.addLayer)
  const layerList = useLayerStore((state) => state.layerList)
  const clearLayer = useLayerStore((state) => state.clearLayer)
  const type = useTextStore((state) => state.type)

  const lineTest = () => {
    if (typeof jsonText === 'string') {
      if (!map) return
      const res = computeLineTest(jsonText)
      const regionList = res!.geoTripleResultList.map((res) => [
        res.region,
        res.coord,
      ])
      regionList.forEach((region) => {
        const [polygon, coord] = region as [GeolocusObject, Position2]
        const point84 = toWgs84(generatePointByCoord(coord))
        const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
        const id = (Date.now() + Math.random()).toString()
        addGeoJSONToMap(map, id + 'point', point84, 'circle', {
          'circle-color': '#403877',
        })
        addGeoJSONToMap(map, id, polygon84, 'fill', {
          'fill-outline-color': '#15803d',
          'fill-color': '#4ade80',
          'fill-opacity': 0.5,
        })
        addLayer(id)
      })

      const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
      resultGridList.forEach((item, index) => {
        const region = regionList[index][0] as GeolocusObject
        if (!item || !region) return
        const pngBlob = generateBlobPng(item.grid!)
        const bbox = convertToWgs84(
          region.getGeometry().getBBox().slice(0, 2) as Position2,
        ).concat(
          convertToWgs84(
            region.getGeometry().getBBox().slice(2, 4) as Position2,
          ),
        )
        const id = (Date.now() + Math.random()).toString()
        addImageToMap(map, id, pngBlob, bbox)
        addLayer(id)
      })

      const line = res?.result as GeolocusObject
      const line84 = toWgs84(geolocusContext.toGeoJSON(line))
      addGeoJSONToMap(map, line.getName() as string, line84, 'line', {
        'line-color': '#dc2626',
        'line-width': 2,
      })
      addLayer(line.getName() as string)
    }
  }

  const polygonTest = () => {
    if (typeof jsonText === 'string') {
      if (!map) return
      const res = computePolygonTest(jsonText)
      const regionList = res!.geoTripleResultList.map((res) => [
        res.region,
        res.coord,
      ])
      regionList.forEach((region) => {
        const [polygon, coord] = region as [GeolocusObject, Position2]
        const point84 = toWgs84(generatePointByCoord(coord))
        const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
        const id = (Date.now() + Math.random()).toString()
        addGeoJSONToMap(map, id + 'point', point84, 'circle', {
          'circle-color': '#403877',
        })
        addGeoJSONToMap(map, id, polygon84, 'fill', {
          'fill-outline-color': '#15803d',
          'fill-color': '#4ade80',
          'fill-opacity': 0.5,
        })
        addLayer(id)
      })

      const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
      resultGridList.forEach((item, index) => {
        const region = regionList[index][0] as GeolocusObject
        if (!item || !region) return
        const pngBlob = generateBlobPng(item.grid!)
        const bbox = convertToWgs84(
          region.getGeometry().getBBox().slice(0, 2) as Position2,
        ).concat(
          convertToWgs84(
            region.getGeometry().getBBox().slice(2, 4) as Position2,
          ),
        )
        const id = (Date.now() + Math.random()).toString()
        addImageToMap(map, id, pngBlob, bbox)
        addLayer(id)
      })

      const polygon = res?.result as GeolocusObject
      const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
      addGeoJSONToMap(map, polygon.getName() as string, polygon84, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': 'rgba(255, 0, 0, 0.3)',
      })
      addLayer(polygon.getName() as string)
    }
  }

  useEffect(() => {
    setJsonText(JSON.stringify(text, null, 2))
  }, [])

  return (
    <div
      className="flex h-full flex-col rounded border border-slate-400
        bg-slate-100"
    >
      <div className="h-9 border-b border-b-slate-400 px-2 leading-9">
        JSON格式化数据
      </div>
      <CodeMirror
        ref={textRef}
        height="310px"
        width="380px"
        value={jsonText || ''}
        extensions={[json()]}
        onChange={(val) => {
          setJsonText(val)
        }}
      />
      <div
        className="flex flex-1 flex-row-reverse items-center border-t
          border-t-slate-400 *:mx-2"
      >
        <Button
          onClick={() => {
            if (type === 'point') {
              if (typeof jsonText === 'string') {
                if (!map) return
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const res = computePointTest(jsonText)!
                console.log(res)
                const region = res.region as GeolocusObject
                const pdfGrid = res.regionPdfGrid as GeolocusGrid
                const result = res.result as GeolocusObject
                const coord = result.getGeometry().getCenter() as Position2

                const polygon = region
                const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
                let id = (Date.now() + Math.random()).toString()
                addGeoJSONToMap(map, id, polygon84, 'fill', {
                  'fill-outline-color': '#15803d',
                  'fill-color': '#4ade80',
                  'fill-opacity': 0.5,
                })
                addLayer(id)

                const pngBlob = generateBlobPng(pdfGrid)
                const bbox = convertToWgs84(
                  region.getGeometry().getBBox().slice(0, 2) as Position2,
                ).concat(
                  convertToWgs84(
                    region.getGeometry().getBBox().slice(2, 4) as Position2,
                  ),
                )
                id = (Date.now() + Math.random()).toString()
                addImageToMap(map, id, pngBlob, bbox)
                addLayer(id)

                const coord84 = convertToWgs84(coord)
                const point = generatePointByCoord(coord84)
                addGeoJSONToMap(map, 'kxh-point', point, 'circle', {
                  'circle-color': '#dc2626',
                  'circle-radius': 6,
                })
                addLayer('kxh-point')
              }
            } else if (type === 'line') {
              lineTest()
            } else {
              polygonTest()
            }
          }}
        >
          计算
        </Button>
        <Button
          onClick={() => {
            if (!map) return
            setJsonText(null)
            layerList.forEach((id) => {
              removeMapLayer(map, id)
              removeMapSource(map, id)
            })
            clearLayer()
          }}
        >
          清空
        </Button>
      </div>
    </div>
  )
}
