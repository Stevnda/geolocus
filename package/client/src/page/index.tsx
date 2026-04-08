import React from 'react'
import { Header } from '@/component/layout'
import { useLocation, useRoutes } from 'react-router-dom'
import { routes } from '@/router'

export const App: React.FC = () => {
  const element = useRoutes(routes)
  const { pathname } = useLocation()
  const showHeader = pathname.startsWith('/geolocus')

  return (
    <div className="flex h-screen w-screen flex-col text-black">
      {showHeader ? <Header /> : null}
      {element}
    </div>
  )
}
