import React from 'react'
import { Tabs, Button } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { RouteEcharts } from './RouteEcharts'
import { useResultStore } from '@/store/resultStore'

interface RangeInputProps {
  messageIndex: number
  onClose: () => void
}

export const RegionResult: React.FC<RangeInputProps> = ({
  messageIndex,
  onClose,
}) => {
  const resultList = useResultStore((state) => state.resultList)

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 顶栏 */}
      <div className="flex items-center border-b border-slate-300">
        <div className="p-4">位置估计计算结果</div>
      </div>

      {/* 计算结果内容 */}
      <div className="flex-1 p-4 ">
        <Tabs
          className="h-full rounded-lg border border-slate-300 bg-white p-4
            shadow-xl shadow-slate-300"
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '路由',
              children: (
                <div className="h-[62vh] ">
                  <RouteEcharts result={resultList[messageIndex]} />
                </div>
              ),
            },
            {
              key: '2',
              label: '三元组',
              children: <div className="h-[62vh] "></div>,
            },
            {
              key: '3',
              label: '计算结果',
              children: <div className="h-[62vh] "></div>,
            },
          ]}
        />
      </div>

      {/* 底栏 */}
      <div
        className="flex justify-end space-x-4 border-t border-slate-300 px-4
          py-2"
      >
        <Button
          type="primary"
          onClick={handleClose}
          size="large"
          icon={<CheckOutlined />}
        >
          导出结果
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
