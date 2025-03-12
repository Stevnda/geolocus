/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from 'react'
import { ChatBox } from './ChatBox'
import { InputBox } from './InputBox'
import { Select } from 'antd'
import systemAvatar from '../../assert/system.svg'
import userAvatar from '../../assert/user.svg'
import { ChatMessage, useMapStore, useMessageStore } from '@/store'
import { JsonText } from './JsonText'
import { deepseek, examText } from '@/util/deepseek.util'
import { generatePointByCoord } from '@/util/geojson.util'
import {
  computeLineTest,
  computePointTest,
  computePolygonTest,
  initContext,
} from '@/util/geolocus.util'
import { generateBlobPng } from '@/util/image.util'
import {
  addGeoJSONToMap,
  convertToWgs84,
  addImageToMap,
} from '@/util/mapbox.util'
import { GeolocusGrid, GeolocusObject, Position2 } from '@geolocus/core'
import { toWgs84 } from '@turf/projection'
import { RoleInfo } from './RoleInfo'
import { RegionResult } from './RegionResult'
import { useResultStore } from '@/store/resultStore'

const roles = [{ label: '研究生', value: 'default' }]
const geometryTypes = [
  { label: '点', value: 'point' },
  { label: '线', value: 'line' },
  { label: '面', value: 'polygon' },
  { label: '羊山公园', value: 'exam1' },
  { label: '新街口', value: 'exam2' },
  { label: '新生导引', value: 'exam3' },
  { label: '战前部署', value: 'exam4' },
]
const systemStates = ['正在解析...', '解析完成', '正在计算...', '计算完成']

export const Chat: React.FC = () => {
  const chatMessageList = useMessageStore((state) => state.chatMessageList)
  const getMessageList = useMessageStore((state) => state.getChatMessageList)
  const addChatMessage = useMessageStore((state) => state.addChatMessage)
  const updateChatMessageList = useMessageStore(
    (state) => state.updateChatMessageList,
  )
  const clearChatMessageList = useMessageStore(
    (state) => state.clearChatMessageList,
  )
  const addJsonMessage = useMessageStore((state) => state.addJsonMessage)
  const map = useMapStore((state) => state.map)
  const addResult = useResultStore((state) => state.addResult)

  // State
  const [selectedRole, setSelectedRole] = useState<string>(roles[0].value)
  const [geometryType, setGeometryType] = useState<string>('point')
  const [isInput, setIsInput] = useState<boolean>(true) // inputBox 是否可以输入
  const [showContentType, setShowContentType] = useState<
    'none' | 'prompt' | 'json' | 'computation'
  >('none') // 显示 message 对应内容组件
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1) // 当前选中的消息的索引

  // Initialize with system welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      content: '请输入描述性地理位置',
      timestamp: new Date(),
      userName: 'System',
      type: 'prompt',
      isDone: true,
      avatar: systemAvatar,
    }
    addChatMessage(welcomeMessage)

    return () => {
      clearChatMessageList()
    }
  }, [])

  const pointTest = (jsonText: string) => {
    if (!map) return
    const geolocusContext = initContext()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const res = computePointTest(geolocusContext, jsonText)!
    addResult(geolocusContext, res)
    const region = res.region as GeolocusObject
    const pdfGrid = res.regionPdfGrid as GeolocusGrid
    const result = res.result as GeolocusObject
    const coord = result.getGeometry().getCenter() as Position2

    const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
      'fill-outline-color': '#15803d',
      'fill-color': '#4ade80',
      'fill-opacity': 0.5,
    })

    const pngBlob = generateBlobPng(pdfGrid)
    const bbox = convertToWgs84(
      region.getGeometry().getBBox().slice(0, 2) as Position2,
    ).concat(
      convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
    )
    addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox)

    const coord84 = convertToWgs84(coord)
    const point = generatePointByCoord(coord84)
    addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
      'circle-color': '#dc2626',
      'circle-radius': 6,
    })
  }

  const lineTest = (jsonText: string) => {
    if (!map) return
    const geolocusContext = initContext()
    const res = computeLineTest(geolocusContext, jsonText)!
    addResult(geolocusContext, res)
    const regionList = res!.geoTripleResultList.map((res) => [
      res.region,
      res.coord,
    ])
    regionList.forEach((region) => {
      const [polygon, coord] = region as [GeolocusObject, Position2]
      const point84 = toWgs84(generatePointByCoord(coord))
      const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
      addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
        'circle-color': '#403877',
      })
      addGeoJSONToMap(map, polygon.getUUID() + 'region', polygon84, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': '#4ade80',
        'fill-opacity': 0.5,
      })
    })

    const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
    resultGridList.forEach((item, index) => {
      const region = regionList[index][0] as GeolocusObject
      if (!item || !region) return
      const pngBlob = generateBlobPng(item.grid!)
      const bbox = convertToWgs84(
        region.getGeometry().getBBox().slice(0, 2) as Position2,
      ).concat(
        convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
      )
      addImageToMap(map, region.getUUID() + 'pdfGird', pngBlob, bbox)
    })

    const line = res?.result as GeolocusObject
    const line84 = toWgs84(geolocusContext.toGeoJSON(line))
    addGeoJSONToMap(map, line.getUUID() + 'result', line84, 'line', {
      'line-color': '#dc2626',
      'line-width': 2,
    })
  }

  const polygonTest = (jsonText: string) => {
    if (!map) return
    const geolocusContext = initContext()
    const res = computePolygonTest(geolocusContext, jsonText)!
    addResult(geolocusContext, res)
    const regionList = res!.geoTripleResultList.map((res) => [
      res.region,
      res.coord,
    ])
    regionList.forEach((region) => {
      const [polygon, coord] = region as [GeolocusObject, Position2]
      const point84 = toWgs84(generatePointByCoord(coord))
      const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
      addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
        'circle-color': '#403877',
      })
      addGeoJSONToMap(map, polygon.getUUID() + 'region', polygon84, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': '#4ade80',
        'fill-opacity': 0.5,
      })
    })

    const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
    resultGridList.forEach((item, index) => {
      const region = regionList[index][0] as GeolocusObject
      if (!item || !region) return
      const pngBlob = generateBlobPng(item.grid!)
      const bbox = convertToWgs84(
        region.getGeometry().getBBox().slice(0, 2) as Position2,
      ).concat(
        convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
      )
      addImageToMap(map, region.getUUID() + 'pdfGird', pngBlob, bbox)
    })

    const polygon = res?.result as GeolocusObject
    const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
    addGeoJSONToMap(map, polygon.getUUID() + 'result', polygon84, 'fill', {
      'fill-outline-color': '#15803d',
      'fill-color': 'rgba(255, 0, 0, 0.3)',
    })
  }

  const yangShanTest = () => {
    if (!map) return
    map.setCenter([118.92, 32.11])
    map.setZoom(13)

    const jsonText = JSON.stringify(examText.yangshan.at(-1), null, 2)

    const geolocusContext = initContext()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const res = computePointTest(geolocusContext, jsonText)!
    console.log(res)
    addResult(geolocusContext, res)
    const region = res.region as GeolocusObject
    const pdfGrid = res.regionPdfGrid as GeolocusGrid

    // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
    //   'fill-outline-color': '#15803d',
    //   'fill-color': '#4ade80',
    //   'fill-opacity': 0.5,
    // })

    const pngBlob = generateBlobPng(pdfGrid)
    const bbox = convertToWgs84(
      region.getGeometry().getBBox().slice(0, 2) as Position2,
    ).concat(
      convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
    )
    addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox, 0.6)
    // const result = res.result as GeolocusObject
    // const coord = result.getGeometry().getCenter() as Position2
    // const coord84 = convertToWgs84(coord)
    // const point = generatePointByCoord(coord84)
    // addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
    //   'circle-color': '#dc2626',
    //   'circle-radius': 6,
    // })
  }

  const xinjieoku = () => {
    if (!map) return
    map.setCenter([118.76, 32.04])
    map.setZoom(13)

    const jsonText = JSON.stringify(examText.yinjiekou[0], null, 2)

    const geolocusContext = initContext()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const res = computePointTest(geolocusContext, jsonText)!
    console.log(res)
    addResult(geolocusContext, res)
    const region = res.region as GeolocusObject
    const pdfGrid = res.regionPdfGrid as GeolocusGrid
    const result = res.result as GeolocusObject
    const coord = result.getGeometry().getCenter() as Position2

    // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
    //   'fill-outline-color': '#15803d',
    //   'fill-color': '#4ade80',
    //   'fill-opacity': 0.5,
    // })

    const pngBlob = generateBlobPng(pdfGrid, 0.95)
    const bbox = convertToWgs84(
      region.getGeometry().getBBox().slice(0, 2) as Position2,
    ).concat(
      convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
    )
    addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox, 0.6)
    const coord84 = convertToWgs84(coord)
    const point = generatePointByCoord(coord84)
    addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
      'circle-color': '#dc2626',
      'circle-radius': 6,
    })
  }

  const handleSubmit = async (content: string) => {
    if (geometryType.includes('exam')) {
      if (geometryType === 'exam1') {
        yangShanTest()
      } else if (geometryType === 'exam2') {
        xinjieoku()
      }
      return
    }
    setIsInput(false)

    // Add user message
    const userMessage: ChatMessage = {
      content,
      timestamp: new Date(),
      userName: selectedRole || '测试用户',
      type: 'user',
      isDone: true,
      avatar: userAvatar,
    }

    // Add system response message
    addChatMessage(userMessage)

    // Start parsing
    let systemMessage: ChatMessage = {
      content: systemStates[0],
      timestamp: new Date(),
      userName: 'System',
      type: 'json',
      isDone: false,
      avatar: systemAvatar,
    }
    addChatMessage(systemMessage)
    const messageSize = getMessageList().length
    let jsonText = await deepseek(userMessage.content)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = JSON.parse(jsonText) as any[]
    const tripleList = arr.map((item) => {
      return {
        role: 'default',
        ...item,
      }
    })
    jsonText = JSON.stringify(tripleList, null, 2)
    addJsonMessage({
      content: jsonText,
      userName: 'System',
    })
    // update message
    systemMessage = {
      content: systemStates[1],
      timestamp: new Date(),
      userName: 'System',
      type: 'json',
      isDone: true,
      avatar: systemAvatar,
    }
    updateChatMessageList(messageSize - 1, systemMessage)

    // Start computing
    systemMessage = {
      content: systemStates[2],
      timestamp: new Date(),
      userName: 'System',
      type: 'computation',
      isDone: false,
      avatar: systemAvatar,
    }
    addChatMessage(systemMessage)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (geometryType === 'point') {
      pointTest(jsonText)
    } else if (geometryType === 'line') {
      lineTest(jsonText)
    } else if (geometryType === 'polygon') {
      polygonTest(jsonText)
    }
    // update message
    systemMessage = {
      content: systemStates[3],
      timestamp: new Date(),
      userName: 'System',
      type: 'computation',
      isDone: true,
      avatar: systemAvatar,
    }
    updateChatMessageList(messageSize, systemMessage)

    setIsInput(true)
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="border-b border-slate-300 p-3 px-4">
        <div className="mb-[-8px] flex flex-wrap *:mb-2">
          <div className="mr-10 flex items-center">
            <div className="pr-2">描述角色:</div>
            <Select
              placeholder="选择角色"
              options={roles}
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: 160 }}
            />
          </div>
          <div className="flex items-center">
            <div className="pr-2">描述类型:</div>
            <Select
              placeholder="选择几何类型"
              options={geometryTypes}
              value={geometryType}
              onChange={setGeometryType}
              style={{ width: 160 }}
            />
          </div>
        </div>
      </div>
      <ChatBox
        messages={chatMessageList}
        handleClick={(
          type: 'prompt' | 'json' | 'computation',
          index: number,
        ) => {
          if (!chatMessageList[index].isDone) return
          setSelectedMessageIndex(index)
          if (type === 'json') {
            setShowContentType('json')
          } else if (type === 'computation') {
            setShowContentType('computation')
          } else if (type === 'prompt') {
            setShowContentType('prompt')
          }
        }}
      />
      <InputBox onSubmit={handleSubmit} isInput={isInput} />
      {showContentType === 'prompt' && (
        <div className="absolute inset-0 bg-white">
          <RoleInfo onClose={() => setShowContentType('none')} />
        </div>
      )}
      {showContentType === 'json' && (
        <div className="absolute inset-0 bg-white">
          <JsonText
            messageIndex={Math.floor(selectedMessageIndex / 3)}
            onClose={() => setShowContentType('none')}
          />
        </div>
      )}
      {showContentType === 'computation' && (
        <div className="absolute inset-0 bg-white">
          <RegionResult
            messageIndex={Math.floor((selectedMessageIndex - 1) / 3)}
            onClose={() => setShowContentType('none')}
          />
        </div>
      )}
    </div>
  )
}
