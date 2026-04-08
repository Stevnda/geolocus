import React from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useNavigate } from 'react-router-dom'

export const Login: React.FC = () => {
  const navigate = useNavigate()

  const onFinish = () => {
    navigate('/geolocus/scene')
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_42%,_#e2e8f0_100%)]
        px-6 py-10"
    >
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/75
          shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]"
      >
        <section
          className="relative flex min-h-[420px] flex-col justify-between overflow-hidden
            bg-[linear-gradient(160deg,_#0f172a_0%,_#1e3a8a_48%,_#38bdf8_100%)] px-8 py-10 text-white md:px-12
            md:py-14"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-10 top-16 h-56 w-56 rounded-full border border-white/15" />
            <div className="absolute right-20 top-24 h-40 w-40 rounded-full border border-white/10" />
            <div
              className="absolute bottom-16 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/30
                to-transparent"
            />
          </div>

          <div className="relative z-10 space-y-8">
            <span
              className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm
                tracking-[0.28em] text-slate-100"
            >
              GEOLOCUS
            </span>

            <div className="max-w-md space-y-4">
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                地理
                <br />
                推断平台
              </h1>
              <p className="max-w-xs text-sm leading-7 text-slate-100/78 md:text-base">
                Spatial intelligence workspace
              </p>
            </div>

            <div
              className="grid max-w-sm grid-cols-2 gap-3 rounded-[28px] border border-white/15 bg-white/10 p-4
                backdrop-blur-sm"
            >
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <div className="text-2xl font-semibold">01</div>
                <div className="mt-1 text-xs tracking-[0.22em] text-slate-100/70">
                  SCENE
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/20 px-4 py-3">
                <div className="text-2xl font-semibold">02</div>
                <div className="mt-1 text-xs tracking-[0.22em] text-slate-100/70">
                  RESOURCE
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-6">
            <div className="text-sm tracking-[0.26em] text-slate-100/72">
              SPATIAL ANALYSIS PORTAL
            </div>
            <div className="grid gap-2 text-right text-sm text-slate-100/85">
              <div>场景管理</div>
              <div>资源配置</div>
              <div>空间定位</div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 md:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                登录系统
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                请输入账号信息以访问平台服务。
              </p>
            </div>

            <Form
              layout="vertical"
              size="large"
              initialValues={{ remember: true, username: 'demo' }}
              onFinish={onFinish}
            >
              <Form.Item label="用户名" name="username">
                <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item label="密码" name="password">
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>记住我</Checkbox>
              </Form.Item>

              <Form.Item className="mb-3">
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  className="h-12 rounded-xl"
                >
                  登录并进入
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>
      </div>
    </main>
  )
}
