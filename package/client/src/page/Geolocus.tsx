import React from 'react'
import {
  AppstoreOutlined,
  MailOutlined,
  RadarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
  {
    key: 'scene',
    label: '应用场景',
    icon: <MailOutlined />,
  },
  {
    key: 'resource',
    label: '先验知识资源库',
    icon: <AppstoreOutlined />,
    children: [
      { key: 'reference', label: '参考系统资源库' },
      { key: 'role', label: '描述角色资源库' },
      { key: 'object', label: '地名地址资源库' },
      { key: 'template', label: '空间模板资源库' },
      { key: 'relation', label: '要素关系资源库' },
    ],
  },
  {
    key: 'editor',
    label: '上下文编辑器',
    icon: <SettingOutlined />,
  },
  {
    key: 'location',
    label: '空间定位',
    icon: <RadarChartOutlined />,
  },
]

export const Geolocus: React.FC = () => {
  const navigate = useNavigate()
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e)
    navigate(e.key)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col">
        <Menu
          className="h-full"
          onClick={onClick}
          style={{ width: 256 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={items}
        />
      </div>
      <Outlet></Outlet>
    </div>
  )
}
