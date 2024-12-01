import React from 'react'
import { ChatMessage } from './Chat'
import avatarSvg from '../../assert/avatar.svg'

interface ChatBoxProps {
  messages: ChatMessage[]
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages }) => {
  // const [isDialogOpen, setIsDialogOpen] = useState(false)
  // const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
  //   null,
  // )

  const handleMessageClick = (message: ChatMessage) => {
    console.log(message)
    // setSelectedMessage(message)
    // setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={index} className="flex items-start space-x-3">
          <img
            src={avatarSvg}
            alt="User Avatar"
            className="h-8 w-8 rounded-full"
          />
          <div className="flex-1">
            <div className="text-sm font-medium ">{message.userName}</div>
            <div className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </div>
            <div
              className="mt-1 cursor-pointer rounded bg-gray-100 p-2
                transition-colors hover:bg-gray-200"
              onClick={() => handleMessageClick(message)}
            >
              {message.content}
            </div>
          </div>
        </div>
      ))}

      {/* <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative mx-auto max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium">
              Message Details
            </Dialog.Title>
            <div className="mt-2">
              <p>{selectedMessage?.content}</p>
            </div>
            <button
              className="mt-4 rounded bg-blue-500 px-4 py-2 text-white
                hover:bg-blue-600"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Dialog> */}
    </div>
  )
}
