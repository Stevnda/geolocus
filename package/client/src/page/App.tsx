import React from 'react'
import { Header } from '@/component/layout'
import { useRoutes } from 'react-router-dom'
import { routes } from '@/router'

const App: React.FC = () => {
  const element = useRoutes(routes)

  return (
    <div className="flex h-screen w-screen flex-col text-black">
      <Header />
      {element}
    </div>
  )
}

export default App
