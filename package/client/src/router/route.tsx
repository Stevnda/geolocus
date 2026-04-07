import { Editor } from '@/page/Editor'
import { Geolocation } from '@/page/Geolocation'
import { Geolocus } from '@/page/Geolocus'
import { Login } from '@/page/Login'
import { Resource } from '@/page/Resource'
import { Scene } from '@/page/Scene'
import { Navigate, RouteObject } from 'react-router-dom'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Login></Login>,
  },
  {
    element: <Geolocus></Geolocus>,
    path: '/geolocus',
    children: [
      { index: true, element: <Navigate to={'scene'} replace></Navigate> },
      { path: 'scene', element: <Scene></Scene> },
      { path: 'reference', element: <Resource></Resource> },
      { path: 'editor', element: <Editor /> },
      { path: 'location', element: <Geolocation /> },
    ],
  },
]
