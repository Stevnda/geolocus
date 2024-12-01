import React from 'react'

export const Header: React.FC = () => {
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
        <div>上下文</div>
        <div>位置估计</div>
        <div>语义资源库</div>
      </div>
    </header>
  )
}
