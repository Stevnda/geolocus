/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from 'react'
import { ChatBox } from './ChatBox'
import { InputBox } from './InputBox'
import { Select } from 'antd'
import systemAvatar from '../../assert/system.svg'
import userAvatar from '../../assert/user.svg'
import { ChatMessage, useMapStore, useMessageStore } from '@/store'
import { JsonText } from './JsonText'
import { deepseek } from '@/util/deepseek.util'
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

const roles = [{ label: '测试用户', value: 'default' }]
const geometryTypes = [
  { label: '点', value: 'point' },
  { label: '线', value: 'line' },
  { label: '面', value: 'polygon' },
]
const systemStates = ['正在解析...', '解析完成', '正在计算...', '计算完成']

export const Chat: React.FC = () => {
  // userMessage
  const chatMessageList = useMessageStore((state) => state.chatMessageList)
  const getMessageList = useMessageStore((state) => state.getChatMessageList)
  const addChatMessage = useMessageStore((state) => state.addChatMessage)
  const updateChatMessageList = useMessageStore(
    (state) => state.updateChatMessageList,
  )
  const clearChatMessageList = useMessageStore(
    (state) => state.clearChatMessageList,
  )
  // jsonMessage
  const addJsonMessage = useMessageStore((state) => state.addJsonMessage)
  // map
  const map = useMapStore((state) => state.map)

  // State
  const [selectedRole, setSelectedRole] = useState<string>(roles[0].value)
  const [geometryType, setGeometryType] = useState<string>('point')
  const [isInput, setIsInput] = useState<boolean>(true) // inputBox 是否可以输入
  const [showJsonText, setShowJsonText] = useState(false) // JsonText 组件是否
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
    console.log(res)
    const region = res.region as GeolocusObject
    const pdfGrid = res.regionPdfGrid as GeolocusGrid
    const result = res.result as GeolocusObject
    const coord = result.getGeometry().getCenter() as Position2

    const polygon = region
    const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
    let id = (Date.now() + Math.random()).toString()
    addGeoJSONToMap(map, id, polygon84, 'fill', {
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
    id = (Date.now() + Math.random()).toString()
    addImageToMap(map, id, pngBlob, bbox)

    const coord84 = convertToWgs84(coord)
    const point = generatePointByCoord(coord84)
    addGeoJSONToMap(map, 'kxh-point', point, 'circle', {
      'circle-color': '#dc2626',
      'circle-radius': 6,
    })
  }

  const lineTest = (jsonText: string) => {
    if (!map) return
    const geolocusContext = initContext()
    const res = computeLineTest(geolocusContext, jsonText)
    const regionList = res!.geoTripleResultList.map((res) => [
      res.region,
      res.coord,
    ])
    regionList.forEach((region) => {
      const [polygon, coord] = region as [GeolocusObject, Position2]
      const point84 = toWgs84(generatePointByCoord(coord))
      const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
      const id = (Date.now() + Math.random()).toString()
      addGeoJSONToMap(map, id + 'point', point84, 'circle', {
        'circle-color': '#403877',
      })
      addGeoJSONToMap(map, id, polygon84, 'fill', {
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
      const id = (Date.now() + Math.random()).toString()
      addImageToMap(map, id, pngBlob, bbox)
    })

    const line = res?.result as GeolocusObject
    const line84 = toWgs84(geolocusContext.toGeoJSON(line))
    addGeoJSONToMap(map, line.getName() as string, line84, 'line', {
      'line-color': '#dc2626',
      'line-width': 2,
    })
  }

  const polygonTest = (jsonText: string) => {
    if (!map) return
    const geolocusContext = initContext()
    const res = computePolygonTest(geolocusContext, jsonText)
    const regionList = res!.geoTripleResultList.map((res) => [
      res.region,
      res.coord,
    ])
    regionList.forEach((region) => {
      const [polygon, coord] = region as [GeolocusObject, Position2]
      const point84 = toWgs84(generatePointByCoord(coord))
      const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
      const id = (Date.now() + Math.random()).toString()
      addGeoJSONToMap(map, id + 'point', point84, 'circle', {
        'circle-color': '#403877',
      })
      addGeoJSONToMap(map, id, polygon84, 'fill', {
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
      const id = (Date.now() + Math.random()).toString()
      addImageToMap(map, id, pngBlob, bbox)
    })

    const polygon = res?.result as GeolocusObject
    const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
    addGeoJSONToMap(map, polygon.getName() as string, polygon84, 'fill', {
      'fill-outline-color': '#15803d',
      'fill-color': 'rgba(255, 0, 0, 0.3)',
    })
  }

  const handleSubmit = async (content: string) => {
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
      <div className="border-b border-slate-200 p-2 px-4">
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
            setShowJsonText(true)
          } else if (type === 'computation') {
            //
          }
        }}
      />
      <InputBox onSubmit={handleSubmit} isInput={isInput} />
      {showJsonText && (
        <div className="absolute inset-0 bg-white">
          <JsonText
            messageIndex={Math.floor(selectedMessageIndex / 3)}
            onClose={() => setShowJsonText(false)}
          />
        </div>
      )}
    </div>
  )
}
