import React from 'react'
import {
  TagOutlined,
  MailOutlined,
  RadarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Button, Menu } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
  {
    key: 'scene',
    label: '应用场景',
    icon: <MailOutlined />,
  },
  // {
  //   key: 'resource',
  //   label: '先验知识资源库',
  //   icon: <AppstoreOutlined />,
  //   children: [
  //     { key: 'reference', label: '参考系统资源库' },
  //     { key: 'role', label: '描述角色资源库' },
  //     { key: 'object', label: '地名地址资源库' },
  //     { key: 'template', label: '空间模板资源库' },
  //     { key: 'relation', label: '要素关系资源库' },
  //   ],
  // },
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
      <div className="flex flex-col border-r border-slate-200 bg-white">
        <Menu
          className="h-full text-lg [&_.ant-menu-item]:h-14 [&_.ant-menu-item]:leading-[56px]
            [&_.ant-menu-item-icon]:text-xl [&_.ant-menu-submenu-title]:h-14
            [&_.ant-menu-submenu-title]:leading-[56px] [&_.ant-menu-submenu-title_.ant-menu-item-icon]:text-xl
            [&_.ant-menu-title-content]:text-[18px]"
          onClick={onClick}
          style={{ width: 300 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={items}
        />
        <div className="border-t border-slate-200 p-4">
          <Button
            block
            size="large"
            icon={<TagOutlined />}
            className="h-14 rounded-xl border-dashed border-slate-300 text-lg text-slate-600
              [&_.anticon]:text-xl"
          >
            标注平台
          </Button>
        </div>
      </div>
      <Outlet></Outlet>
    </div>
  )
}
