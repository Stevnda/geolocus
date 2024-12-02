import { ChatMessage } from '@/store'
import React from 'react'

interface ChatBoxProps {
  messages: ChatMessage[]
  handleClick: (type: 'prompt' | 'json' | 'computation', index: number) => void
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, handleClick }) => {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start space-x-3 ${
            message.type !== 'user' ? '' : 'flex-row-reverse space-x-reverse'
          }`}
        >
          <img
            src={message.avatar}
            alt={`${message.userName} Avatar`}
            className="h-8 w-8 rounded-full"
          />
          <div
            className={`flex max-w-[70%] flex-col ${
              message.type !== 'user' ? '' : 'items-end'
            }`}
          >
            <div className="text-sm font-medium">{message.userName}</div>
            <div className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </div>
            <div
              className={`mt-1 rounded p-2 ${
                message.type === 'user'
                  ? 'bg-gray-100'
                  : 'bg-blue-300 hover:cursor-pointer hover:bg-blue-400'
              }`}
              onClick={() => {
                if (message.type === 'user') return
                handleClick(message.type, index)
              }}
            >
              {message.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
