import { useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { Button } from 'antd'
import { useTextStore } from '@/store/textStore'
import {
  computeTest,
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
import { GeolocusObject, Position2 } from '@geolocus/core'
import { useLayerStore } from '@/store/layerStore'

export const JsonText = () => {
  const textRef = useRef<null>(null)
  const jsonText = useTextStore((state) => state.jsonText)
  const setJsonText = useTextStore((state) => state.setJsonText)
  const map = useMapStore((state) => state.map)
  const addLayer = useLayerStore((state) => state.addLayer)
  const layerList = useLayerStore((state) => state.layerList)
  const clearLayer = useLayerStore((state) => state.clearLayer)

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
            if (typeof jsonText === 'string') {
              if (!map) return
              const res = computeTest(jsonText)
              const regionList = res.resultList.map((res) => res.region)
              regionList.forEach((region) => {
                const polygon = region as GeolocusObject
                const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
                const id = (Date.now() + Math.random()).toString()
                addGeoJSONToMap(map, id, polygon84, 'fill', {
                  'fill-outline-color': '#15803d',
                  'fill-color': '#4ade80',
                  'fill-opacity': 0.5,
                })
                addLayer(id)
              })

              const resultGirdList = res.resultList.map((res) => res.resultGird)
              resultGirdList.forEach((item, index) => {
                const region = regionList[index]
                if (!item || !region) return
                const pngBlob = generateBlobPng(item)
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

              const line = res.lineString
              const line84 = toWgs84(geolocusContext.toGeoJSON(line))
              // const coords = line84.coordinates as Position2[]
              // const coordsTransform = chaikin(coords, 0.4, 1)
              // const lineJson = generateLineStringByCoordList(coordsTransform)
              addGeoJSONToMap(map, line.getName() as string, line84, 'line', {
                'line-color': '#dc2626',
                'line-width': 2,
              })
              addLayer(line.getName() as string)
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
