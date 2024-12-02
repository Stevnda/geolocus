import React from 'react'
import { Button } from 'antd'
import { DeleteOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons'
import { useMessageStore } from '@/store'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'

interface JsonTextProps {
  messageIndex: number
  onClose: () => void
}

export const JsonText: React.FC<JsonTextProps> = ({
  messageIndex,
  onClose,
}) => {
  const jsonMessageList = useMessageStore((state) => state.jsonMessageList)
  const clearJsonMessageList = useMessageStore(
    (state) => state.clearJsonMessageList,
  )
  const updateJsonMessageList = useMessageStore(
    (state) => state.updateJsonMessageList,
  )

  const [textValue, setTextValue] = React.useState(
    jsonMessageList[messageIndex]?.content || '',
  )

  const handleClose = () => {
    onClose()
  }

  const handleClear = () => {
    clearJsonMessageList()
    setTextValue('')
  }

  const handleSave = () => {
    if (jsonMessageList[messageIndex]) {
      updateJsonMessageList(messageIndex, {
        ...jsonMessageList[messageIndex],
        content: textValue,
      })
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar */}
      <div className="flex items-center border-b border-slate-200">
        <div className="p-2 px-4">结构化文本</div>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-4">
        <CodeMirror
          //   height="310px"
          //   width="380px"
          className="h-full border *:h-full"
          value={textValue || ''}
          extensions={[json()]}
          onChange={(val) => {
            setTextValue(val)
          }}
        />
      </div>

      {/* Bottom Bar */}
      <div
        className="flex justify-end space-x-4 border-t border-slate-200 px-4
          py-2"
      >
        <Button
          type="primary"
          onClick={handleClear}
          size="large"
          icon={<DeleteOutlined />}
        >
          清空
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          size="large"
          icon={<SaveOutlined />}
        >
          保存
        </Button>
        <Button
          type="primary"
          onClick={handleClose}
          size="large"
          icon={<CheckOutlined />}
        >
          确认
        </Button>
      </div>
    </div>
  )
}
