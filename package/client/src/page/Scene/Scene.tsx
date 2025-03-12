import shenliao from '../../assert/shenliao.jpg'
import nanjing from '../../assert/nanjing.png'
import { Card, Row, Col, Button } from 'antd'

const { Meta } = Card

const cardData = [
  {
    title: '南京师范大学新生导引',
    description: '南京市地理科学学院新生导引案例',
    imageUrl: nanjing,
  },
  {
    title: '沈辽战役战前部署',
    description: '沈辽战役战前部署案例',
    imageUrl: shenliao,
  },
]

export const Scene = () => {
  return (
    <div className="relative w-full h-full">
      <div className="flex relative h-[88vh] border border-slate-300 bg-slate-100 flex-row m-6 rounded-lg shadow-xl ">
        <div className="absolute top-4 right-4">
          <Button size="large">新建场景</Button>
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
                  <Button>编辑</Button>
                  <Button>删除</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}
