import { MapView } from './map'

const App = () => {
  return (
    <div className="flex h-screen w-screen flex-col bg-green-100">
      <div className="flex h-16 items-center bg-blue-400 pl-6 text-2xl leading-8">
        这是一个标题
      </div>
      <div className="relative flex-auto bg-red-100">
        <div
          className="absolute left-4 top-4 z-10 flex h-[90vh] w-96 flex-col
            items-center rounded bg-slate-50 shadow-xl"
        >
          <div className="w-80 flex-1 bg-green-100">1</div>
          <div className="w-80 flex-1 bg-blue-100">1</div>
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
