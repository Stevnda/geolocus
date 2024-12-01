import React, { useState } from 'react'
import { ChatBox } from './ChatBox'
import { InputBox } from './InputBox'
import { Select } from 'antd'

export interface ChatMessage {
  content: string
  timestamp: Date
  userName: string
}

const roles = [
  { label: '测试用户1', value: '测试用户1' },
  { label: '测试用户2', value: '测试用户2' },
]
const geometryTypes = [
  { label: '点', value: 'point' },
  { label: '线', value: 'line' },
  { label: '面', value: 'polygon' },
]

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [geometryType, setGeometryType] = useState<string>('point')

  const handleSubmit = (content: string) => {
    const newMessage: ChatMessage = {
      content,
      timestamp: new Date(),
      userName: selectedRole,
    }
    setMessages([...messages, newMessage])
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 p-2 px-4">
        <div className="mb-[-8px] flex flex-wrap *:mb-2">
          <div className="mr-10 flex items-center">
            <div className="pr-2">描述角色:</div>
            <Select
              placeholder="选择角色"
              options={roles}
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: 160 }}
            />
          </div>
          <div className="flex items-center">
            <div className="pr-2">描述类型:</div>
            <Select
              placeholder="选择几何类型"
              options={geometryTypes}
              value={geometryType}
              onChange={setGeometryType}
              style={{ width: 160 }}
            />
          </div>
        </div>
      </div>
      <ChatBox messages={messages} />
      <InputBox onSubmit={handleSubmit} />
    </div>
  )
}
