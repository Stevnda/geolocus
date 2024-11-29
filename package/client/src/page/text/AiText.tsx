import { useLayerStore } from '@/store/layerStore'
import { useMapStore } from '@/store/mapStore'
import { useTextStore } from '@/store/textStore'
import { aiLineTest } from '@/util/deepseek.uti'
import { removeMapLayer, removeMapSource } from '@/util/mapbox.util'
import { Button, Input } from 'antd'

const { TextArea } = Input

export const AiText = () => {
  const map = useMapStore((state) => state.map)
  const type = useTextStore((state) => state.type)
  const aiText = useTextStore((state) => state.aiText)
  const setAiText = useTextStore((state) => state.setAiText)
  const setJsonText = useTextStore((state) => state.setJsonText)
  const layerList = useLayerStore((state) => state.layerList)
  const clearLayer = useLayerStore((state) => state.clearLayer)

  return (
    <div
      className="flex h-full flex-col rounded border border-slate-400
        bg-slate-100"
    >
      <div className="h-9 border-b border-b-slate-400 px-2 leading-9">
        描述性地理位置
      </div>
      <TextArea
        rows={4}
        className="flex-1 rounded-none"
        value={aiText || ''}
        onChange={(e) => {
          setAiText(e.target.value)
        }}
      />
      <div
        className=" flex flex-row-reverse items-center border-t
          border-t-slate-400 py-1 *:mx-2"
      >
        <Button
          onClick={async () => {
            if (!aiText || !map) return
            setJsonText(null)
            layerList.forEach((id) => {
              removeMapLayer(map, id)
              removeMapSource(map, id)
            })
            clearLayer()
            const res = await aiLineTest(aiText)
            console.log(res)
            if (!res) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const arr = JSON.parse(res).response as any[]
            const id = Date.now()
            const tripleList = arr.map((value) => {
              if (type === 'point') {
                return {
                  role: 'default',
                  target: 'kxh' + id,
                  ...value,
                }
              } else {
                return {
                  role: 'default',
                  target: 'taiwan',
                  ...value,
                }
              }
            })
            setJsonText(JSON.stringify(tripleList, null, 2))
          }}
        >
          解析
        </Button>
      </div>
    </div>
  )
}
