import React, { useState, useRef, useCallback, useEffect } from 'react'
import { MapView } from '../map'
import { Button, Form, Input, InputNumber, Radio, Space } from 'antd'
import { CheckOutlined } from '@ant-design/icons'

interface RangeInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

const RangeInput: React.FC<RangeInputProps> = ({
  value = [0, 0],
  onChange,
}) => (
  <Space>
    <InputNumber
      value={value[0]}
      onChange={(v) => onChange?.([v || 0, value[1]])}
    />
    <span>-</span>
    <InputNumber
      value={value[1]}
      onChange={(v) => onChange?.([value[0], v || 0])}
    />
  </Space>
)

interface RoleInfoProps {
  onClose: () => void
}

export const RoleInfo: React.FC<RoleInfoProps> = ({ onClose }) => {
  const [form] = Form.useForm()
  const formTestData = {
    roleName: `测试用户`,
    distanceThreshold: 0.2,
    directionThreshold: 90,
    initialOrientation: 0,
    semanticMapping: [
      [0, 10000],
      [10000, 30000],
      [30000, 100000],
      [100000, 300000],
      [300000, 2000000],
    ],
    roleWeight: 1,
    spatialReference: `EPSG:4326`,
    defaultUser: true,
  }

  useEffect(() => {
    form.setFieldsValue(formTestData)
  }, [form])

  return (
    <div className="flex h-full flex-col ">
      <Form
        form={form}
        layout="vertical"
        className="mx-auto my-4 w-[22vw] h-[75vh] overflow-y-scroll rounded-lg border border-slate-300
            bg-white p-6 shadow-xl shadow-slate-300"
      >
        <Form.Item
          label="角色名称"
          name="roleName"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="距离阈值（0 - 1）"
          name="distanceThreshold"
          rules={[{ required: true, message: '请输入距离阈值' }]}
        >
          <InputNumber className="w-full" min={0} max={1} />
        </Form.Item>

        <Form.Item
          label="方向阈值（角度 0 - 360）"
          name="directionThreshold"
          rules={[{ required: true, message: '请输入方向阈值' }]}
        >
          <InputNumber className="w-full" min={0} max={360} />
        </Form.Item>

        <Form.Item
          label="初始朝向（角度 0 - 360）"
          name="initialOrientation"
          rules={[{ required: true, message: '请输入初始朝向' }]}
        >
          <InputNumber className="w-full" min={0} max={360} />
        </Form.Item>

        <Form.Item
          label="语义距离映射（米）"
          name="semanticMapping"
          rules={[{ required: true, message: '请输入语义关系映射范围' }]}
        >
          <div className="flex flex-col space-y-2 *:pl-3">
            <div className="flex items-center">
              <div className="min-w-[80px]">很近:</div>
              <RangeInput
                value={formTestData.semanticMapping[0] as [number, number]}
              />
            </div>
            <div className="flex items-center">
              <div className="min-w-[80px]">近:</div>
              <RangeInput
                value={formTestData.semanticMapping[1] as [number, number]}
              />
            </div>
            <div className="flex items-center">
              <div className="min-w-[80px]">中:</div>
              <RangeInput
                value={formTestData.semanticMapping[2] as [number, number]}
              />
            </div>
            <div className="flex items-center">
              <div className="min-w-[80px]">远:</div>
              <RangeInput
                value={formTestData.semanticMapping[3] as [number, number]}
              />
            </div>
            <div className="flex items-center">
              <div className="min-w-[80px]">很远:</div>
              <RangeInput
                value={formTestData.semanticMapping[4] as [number, number]}
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item
          label="角色权重（>1）"
          name="roleWeight"
          rules={[{ required: true, message: '请输入角色权重' }]}
        >
          <InputNumber className="w-full" min={1} />
        </Form.Item>

        <Form.Item
          label="空间参考"
          name="spatialReference"
          rules={[{ required: true, message: '请输入空间参考' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="默认用户"
          name="defaultUser"
          rules={[{ required: true, message: '请选择是否为默认用户' }]}
        >
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>

      {/* Bottom Bar */}
      <div
        className="flex justify-end space-x-4 border-t border-slate-300 px-4
          py-2"
      >
        <Button
          type="primary"
          onClick={() => onClose()}
          icon={<CheckOutlined />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          确认
        </Button>
      </div>
    </div>
  )
}

export const Editor: React.FC = () => {
  const [isResizing, setIsResizing] = useState(false)
  const [leftWidth, setLeftWidth] = useState(70)
  const containerRef = useRef<HTMLDivElement>(null)

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Limit the minimum and maximum width
      const clampedWidth = Math.min(Math.max(newWidth, 20), 80)
      setLeftWidth(clampedWidth)
    },
    [isResizing],
  )

  React.useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden">
      <div
        className="relative overflow-auto"
        style={{ width: `${leftWidth}%` }}
      >
        <MapView />
      </div>
      <div
        className=" relative z-20 cursor-col-resize select-none bg-slate-400"
        onMouseDown={startResizing}
      >
        <div className="absolute -left-1 h-full w-2" />
        <div className="h-full w-[1px]" />
      </div>
      <div
        className="relative overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <div className="flex flex-col h-full bg-white">
          <div className=" border-b p-2 border-slate-500">侧边工具栏</div>
          <RoleInfo
            onClose={() => {
              console.log('test')
            }}
          />
        </div>
      </div>
    </div>
  )
}
