import React, { useState, useRef, useCallback } from 'react'

interface ResizableLayoutProps {
  LeftComponent: React.ComponentType
  RightComponent: React.ComponentType
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  LeftComponent,
  RightComponent,
}) => {
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
    <div ref={containerRef} className="flex flex-1 overflow-hidden">
      <div
        className="relative overflow-auto"
        style={{ width: `${leftWidth}%` }}
      >
        <LeftComponent />
      </div>
      <div
        className=" relative z-20 cursor-col-resize select-none bg-slate-400"
        onMouseDown={startResizing}
      >
        <div className="absolute -left-1 h-full w-2" />
        <div className="h-full w-[1px]" />
      </div>
      <div
        className="relative overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <RightComponent />
      </div>
    </div>
  )
}
