import { Editor } from '@/page/Editor'
import { Geolocation } from '@/page/Geolocation'
import { Geolocus } from '@/page/Geolocus'
import { Resource } from '@/page/Resource'
import { Scene } from '@/page/Scene'
import { Navigate, RouteObject } from 'react-router-dom'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={'/geolocus'}></Navigate>,
  },
  {
    element: <Geolocus></Geolocus>,
    path: '/geolocus',
    children: [
      { path: 'scene', element: <Scene></Scene> },
      { path: 'reference', element: <Resource></Resource> },
      { path: 'editor', element: <Editor /> },
      { path: 'location', element: <Geolocation /> },
    ],
  },
]
