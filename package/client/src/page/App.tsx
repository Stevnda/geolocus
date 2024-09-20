import { MapView } from './map'
import { AiText, JsonText } from './text'

const App = () => {
  return (
    <div className="flex h-screen w-screen flex-col bg-green-100">
      <div className="flex h-16 items-center bg-blue-400 pl-6 text-2xl leading-8">
        这是一个标题
      </div>
      <div className="relative flex-auto ">
        <div
          className="absolute left-4 top-4 z-10 flex h-[90vh] w-[26rem] flex-col
            items-center rounded border border-slate-300 bg-slate-50 py-2
            shadow-xl *:my-2"
        >
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
