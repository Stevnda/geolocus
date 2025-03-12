import React from 'react'

export const Header: React.FC = () => {
  return (
    <header
      className="flex items-center justify-between border-b border-slate-300
        bg-slate-100 p-4 tracking-wider"
    >
      <div className="text-xl ">面向描述性地理位置的形式化方法与位置估计</div>
    </header>
  )
}
