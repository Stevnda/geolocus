import React, { useState } from 'react'
import { Button, Input } from 'antd'
import { SendOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface InputBoxProps {
  onSubmit: (content: string) => void
  isInput: boolean
}

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, isInput }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-end space-x-2">
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleKeyPress}
          placeholder="请输入消息..."
          autoSize={{ minRows: 1, maxRows: 9 }}
          className="flex-1"
          size="large"
        />
        <div>
          <Button
            type="primary"
            icon={<SendOutlined className="text-lg" />}
            onClick={handleSubmit}
            disabled={!isInput || !input.trim()}
            size="large"
          >
            发送
          </Button>
        </div>
      </div>
    </form>
  )
}
