import React from 'react'
import shenliao from '../../assert/shenliao.jpg'
import nanjing from '../../assert/nanjing.png'
import { Card, Row, Col, Button } from 'antd'
import { SceneFormModal } from './SceneFormModal'

const { Meta } = Card

const cardData = [
  {
    title: '新生入学报到指引',
    description: '新生入学报到指引案例',
    imageUrl: nanjing,
  },
  {
    title: '四渡赤水战役',
    description: '四渡赤水战役',
    imageUrl: shenliao,
  },
]

export const Scene = () => {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create')
  const [activeCardIndex, setActiveCardIndex] = React.useState<number | null>(
    null,
  )

  const openCreateModal = () => {
    setModalMode('create')
    setActiveCardIndex(null)
    setModalOpen(true)
  }

  const openEditModal = (index: number) => {
    setModalMode('edit')
    setActiveCardIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const activeCard =
    activeCardIndex === null ? undefined : cardData[activeCardIndex]

  return (
    <div className="relative w-full h-full">
      <div className="flex relative h-[88vh] border border-slate-300 bg-slate-100 flex-row m-6 rounded-lg shadow-xl ">
        <div className="absolute top-4 right-4">
          <Button size="large" onClick={openCreateModal}>
            新建场景
          </Button>
        </div>
        <Row gutter={[360, 400]}>
          {cardData.map((card, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <Card
                className="w-[300px] h-[400px] ml-8 mt-8 border-1 border-slate-300"
                hoverable
                cover={
                  <img
                    className="ml-5 mt-5 w-[260px] h-[240px]"
                    alt="example"
                    src={card.imageUrl}
                  />
                }
              >
                <Meta title={card.title} description={card.description} />
                <div className="*:ml-2" style={{ marginTop: 20 }}>
                  <Button>进入</Button>
                  <Button onClick={() => openEditModal(index)}>编辑</Button>
                  <Button>删除</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <SceneFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={
          activeCard
            ? {
                title: activeCard.title,
                location: activeCard.description,
              }
            : undefined
        }
        onCancel={closeModal}
        onSubmit={closeModal}
      />
    </div>
  )
}
