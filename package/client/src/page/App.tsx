import { useTextStore } from '@/store/textStore'
import { MapView } from './map'
import { AiText, JsonText } from './text'
import { Radio } from 'antd'

const App = () => {
  const type = useTextStore((state) => state.type)
  const setType = useTextStore((state) => state.setType)

  return (
    <div className="flex h-screen w-screen flex-col bg-green-100">
      <div className="flex h-16 items-center bg-blue-400 pl-6 text-2xl leading-8">
        描述性地理位置形式化模型与估计方法平台
      </div>
      <div className="relative flex-auto ">
        <div
          className="absolute left-4 top-4 z-10 flex h-[90vh] w-[26rem] flex-col
            items-center rounded border border-slate-300 bg-slate-50 py-2
            shadow-xl *:my-2"
        >
          <Radio.Group
            onChange={(e) => {
              setType(e.target.value)
            }}
            value={type}
            className="ml-6 self-start"
          >
            <Radio value={'point'}>点</Radio>
            <Radio value={'line'}>线</Radio>
          </Radio.Group>
          <div className="w-96 flex-1">
            <AiText></AiText>
          </div>
          <div className="w-96 flex-1">
            <JsonText></JsonText>
          </div>
        </div>
        <div
          className="absolute right-4 top-20 z-10 flex h-[70vh] w-14 flex-col
            items-center rounded bg-red-50 shadow-xl"
        ></div>
        <MapView></MapView>
      </div>
    </div>
  )
}

export default App
