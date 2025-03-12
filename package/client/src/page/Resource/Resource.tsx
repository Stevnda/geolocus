import { Button, Input, List, Skeleton } from 'antd'

const { Search } = Input

export const Resource = () => {
  const loadMore = (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        height: 32,
        lineHeight: '32px',
      }}
    >
      <Button>加载更多</Button>
    </div>
  )

  const list = [
    {
      name: 'EPSG:4326',
      type: '地理坐标系',
      desc: 'WGS 84 - 世界大地测量系统1984，使用经纬度表示全球位置。',
    },
    {
      name: 'EPSG:3857',
      type: '投影坐标系',
      desc: 'WGS 84 / Pseudo-Mercator - 常用于Web地图服务（如Google Maps、OpenStreetMap）。',
    },
    {
      name: 'EPSG:4269',
      type: '地理坐标系',
      desc: 'NAD83 - 北美基准1983，用于北美地区的地理坐标系。',
    },
    {
      name: 'EPSG:4267',
      type: '地理坐标系',
      desc: 'NAD27 - 北美基准1927，用于北美地区的地理坐标系。',
    },
    {
      name: 'EPSG:32633',
      type: '投影坐标系',
      desc: 'WGS 84 / UTM zone 33N - 用于欧洲、非洲和中东地区的UTM投影。',
    },
    {
      name: 'EPSG:32733',
      type: '投影坐标系',
      desc: 'WGS 84 / UTM zone 33S - 用于南美洲和非洲南部的UTM投影。',
    },
    {
      name: 'EPSG:26910',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 10N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26911',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 11N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26912',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 12N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26913',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 13N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26914',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 14N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26915',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 15N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26916',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 16N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26917',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 17N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26918',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 18N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26919',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 19N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26920',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 20N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26921',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 21N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26922',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 22N - 用于北美西海岸的UTM投影。',
    },
    {
      name: 'EPSG:26923',
      type: '投影坐标系',
      desc: 'NAD83 / UTM zone 23N - 用于北美西海岸的UTM投影。',
    },
  ]

  return (
    <div className="relative w-full h-full">
      <div className="flex flex-col relative h-[88vh] border border-slate-300 bg-slate-50 m-6 rounded-lg shadow-xl ">
        <div className="m-6 text-lg">参考系统资源库</div>
        <div className="flex relative flex-row items-center">
          <div className="ml-6">参考系统名称：</div>
          <Search placeholder="参考系统名称" style={{ width: 200 }} />
          <div className="ml-6">参考系统类型：</div>
          <Search placeholder="参考系统类型" style={{ width: 200 }} />
          <Button className="ml-40">重置</Button>
          <Button className="ml-6 bg-blue-500 text-white">查询</Button>
        </div>
        <div className="flex relative flex-row items-center mt-12">
          <div className="ml-6">资源列表</div>
          <Button className="absolute right-12 bg-blue-500 text-white">
            新建
          </Button>
        </div>
        <div className="h-[58vh] m-6 bg-white rounded-xl shadow border border-slate-200">
          <List
            className="demo-loadmore-list bg-white rounded-xl m-6 overflow-y-scroll h-[54vh]"
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={list}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a key="list-loadmore-more">预览</a>,
                  <a key="list-loadmore-more">编辑</a>,
                  <a key="list-loadmore-edit">删除</a>,
                ]}
              >
                <Skeleton avatar title={false} loading={false} active>
                  <List.Item.Meta
                    title={<a href="https://ant.design">{item.name}</a>}
                    description={item.desc}
                  />
                  <div>{item.type}</div>
                </Skeleton>
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  )
}
