import React, { useCallback, useRef, useState } from 'react'
import { Chat } from './chat'
import { MapView } from './map'

const Header: React.FC = () => {
  return (
    <header
      className="flex items-center justify-between border-b border-slate-300
        bg-slate-100 p-4 tracking-wider"
    >
      <div className="text-xl ">面向描述性地理位置的形式化方法与位置估计</div>
      <div
        className="mr-4 flex h-full flex-1 flex-row items-center justify-end
          space-x-10 text-xl hover:*:text-sky-600"
      >
        <div>首页</div>
        <div>占位符</div>
        <div>占位符</div>
        <div>占位符</div>
      </div>
    </header>
  )
}

const App: React.FC = () => {
  const [isResizing, setIsResizing] = useState(false)
  const [leftWidth, setLeftWidth] = useState(30)
  const containerRef = useRef<HTMLDivElement>(null)

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Limit the minimum and maximum width
      const clampedWidth = Math.min(Math.max(newWidth, 20), 80)
      setLeftWidth(clampedWidth)
    },
    [isResizing],
  )

  React.useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div className="flex h-screen w-screen flex-col text-black">
      <Header />
      <main ref={containerRef} className="flex flex-1 overflow-hidden">
        <div
          className="relative overflow-auto"
          style={{ width: `${leftWidth}%` }}
        >
          <Chat></Chat>
        </div>
        <div
          className="group relative cursor-col-resize select-none bg-slate-400
            hover:bg-slate-600"
          onMouseDown={startResizing}
        >
          <div className="absolute inset-y-0 -left-1 w-2" />
          <div className="h-full w-[2px]" />
          <div className="absolute inset-y-0 -right-1 w-2" />
        </div>
        <div
          className="relative overflow-auto "
          style={{ width: `${100 - leftWidth}%` }}
        >
          <MapView></MapView>
        </div>
      </main>
    </div>
  )
}

export default App
