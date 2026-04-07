import React from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Upload } from 'antd'
import type { UploadFile, UploadProps } from 'antd'

type SceneFormValues = {
  title?: string
  location?: string
}

type SceneFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: SceneFormValues
  onCancel: () => void
  onSubmit: () => void
}

const { Dragger } = Upload
const { TextArea } = Input

export const SceneFormModal: React.FC<SceneFormModalProps> = ({
  open,
  mode,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<SceneFormValues>()
  const [fileList, setFileList] = React.useState<UploadFile[]>([])

  React.useEffect(() => {
    if (!open) {
      return
    }

    form.setFieldsValue({
      title: initialValues?.title ?? '',
      location: initialValues?.location ?? '',
    })

    setFileList(
      initialValues?.title
        ? [
            {
              uid: '-1',
              name: `${initialValues.title}-封面.png`,
              status: 'done',
            },
          ]
        : [],
    )
  }, [form, initialValues, open])

  const uploadProps: UploadProps = {
    accept: 'image/*',
    beforeUpload: () => false,
    fileList,
    maxCount: 1,
    onChange: ({ fileList: nextFileList }) => {
      setFileList(nextFileList.slice(-1))
    },
  }

  const title = mode === 'create' ? '新建场景' : '编辑场景'

  return (
    <Modal
      open={open}
      title={title}
      width={720}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-4" onFinish={onSubmit}>
        <Form.Item label="上传封面" className="mb-6">
          <Dragger {...uploadProps} className="rounded-2xl">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="text-base font-medium text-slate-700">
              点击或拖拽上传封面
            </p>
            <p className="text-sm text-slate-400">
              支持 JPG、PNG，建议使用横版封面图
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item
          label="标题"
          name="title"
          rules={[{ required: true, message: '请输入场景标题' }]}
        >
          <Input size="large" placeholder="请输入场景标题" />
        </Form.Item>

        <Form.Item
          label="位置描述"
          name="location"
          rules={[{ required: true, message: '请输入位置描述' }]}
        >
          <TextArea
            rows={5}
            placeholder="例如：南京市栖霞区仙林大道163号，面向新生报到场景"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-2">
          <Button size="large" onClick={onCancel}>
            取消
          </Button>
          <Button size="large" type="primary" htmlType="submit">
            保存
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
