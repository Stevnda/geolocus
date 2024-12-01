import { Chat } from './chat'
import { MapView } from './map'
import { ResizableLayout } from '@/component/layout'

export const ChatPage = () => {
  return <ResizableLayout LeftComponent={Chat} RightComponent={MapView} />
}
