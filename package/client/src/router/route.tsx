import { ChatPage } from '@/page/ChatPage'
import { Navigate, RouteObject } from 'react-router-dom'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={'/chat'}></Navigate>,
  },
  {
    element: <ChatPage></ChatPage>,
    path: '/chat',
  },
]
