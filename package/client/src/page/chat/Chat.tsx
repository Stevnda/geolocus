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
import {
  generatePointByCoord,
  generatePolygonByCoordList,
} from '@/util/geojson.util'
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
import {
  GeolocusGrid,
  GeolocusObject,
  Position2,
  UserGeolocusTriple,
} from '@geolocus/core'
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
  { label: '新生导引-空间模板-停车场-门口', value: 'exam3' },
  { label: '新生导引-6-志愿者服务站-学院报到点', value: 'exam4' },
  { label: '新生导引-6-路径', value: 'exam5' },
  { label: '新生导引-xian-学院报到点', value: 'exam6' },
  { label: '新生导引-xian-路径', value: 'exam7' },
  { label: '战前部署', value: 'exam8' },
  { label: '石头城', value: 'exam9' },
  { label: '赤水1', value: 'exam11' },
  { label: '赤水2', value: 'exam12' },
  { label: '赤水3', value: 'exam13' },
  { label: '赤水4', value: 'exam14' },
  { label: '赤水all', value: 'exam15' },
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

    const jsonText = JSON.stringify(examText.yangshan[7], null, 2)

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

    const jsonText = JSON.stringify(examText.yinjiekou[1], null, 2)

    const geolocusContext = initContext()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const res = computePointTest(geolocusContext, jsonText)!
    console.log(res)
    addResult(geolocusContext, res)
    const region = res.region as GeolocusObject
    const pdfGrid = res.regionPdfGrid as GeolocusGrid
    const result = res.result as GeolocusObject
    const coord = result.getGeometry().getCenter() as Position2

    res!.geoTripleResultList.forEach((result, index) => {
      const region = result.region!
      const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
      addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': '#007acc',
        'fill-opacity': 0.4 + index * 0.06,
      })
    })

    const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    console.log(geolocusContext.toGeoJSON(region))
    addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
      'fill-outline-color': '#15803d',
      'fill-color': '#baa1f1',
      'fill-opacity': 0.8,
    })

    const pngBlob = generateBlobPng(pdfGrid, 0.00001)
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

  const nanjingTemplate = () => {
    if (!map) return
    map.setCenter([118.9109, 32.1172])
    map.setZoom(18)

    const door: Position2 = [13237116.183954950422049, 3778680.560240984428674]
    const stop: Position2[][] = [
      [
        [13237061.227027628570795, 3778678.609107472002506],
        [13237099.924508998170495, 3778677.958729634061456],
        [13237099.924508998170495, 3778651.618427191395313],
        [13237061.227027628570795, 3778651.618427191395313],
        [13237061.227027628570795, 3778678.609107472002506],
      ],
    ]
    const doorJson = toWgs84(generatePointByCoord(door))
    const stopJson = toWgs84(generatePolygonByCoordList(stop))
    addGeoJSONToMap(map, 'door', doorJson, 'circle', {
      'circle-color': '#dc2626',
      'circle-radius': 6,
    })
    addGeoJSONToMap(map, 'stop', stopJson, 'fill', {
      'fill-outline-color': '#15803d',
      'fill-color': '#4ade80',
      'fill-opacity': 0.5,
    })
  }

  const nanjing6Point = () => {
    if (!map) return
    map.setCenter([118.9109, 32.1172])
    map.setZoom(17)

    const jsonText = JSON.stringify(examText.nanjing[0], null, 2)

    {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'point')
      const res = geolocusContext.computeFuzzyPointObject('志愿者服务站')!
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

      const pngBlob = generateBlobPng(pdfGrid, 0.05)
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
    {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'point')
      const res = geolocusContext.computeFuzzyPointObject('学院报到点')!
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

      const pngBlob = generateBlobPng(pdfGrid, 0.05)
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
    {
      const door: Position2 = [
        13237116.183954950422049, 3778680.560240984428674,
      ]
      const stop: Position2 = [
        13237153.273958569392562, 3778538.385224879719317,
      ]
      const doorJson = toWgs84(generatePointByCoord(door))
      const stopJson = toWgs84(generatePointByCoord(stop))
      addGeoJSONToMap(map, 'door', doorJson, 'circle', {
        'circle-color': '#1447e6',
        'circle-radius': 6,
      })
      addGeoJSONToMap(map, 'stop', stopJson, 'circle', {
        'circle-color': '#1447e6',
        'circle-radius': 6,
      })
    }
  }

  const nanjing6Line = () => {
    if (!map) return
    map.setCenter([118.9109, 32.1172])
    map.setZoom(17)

    const jsonText = JSON.stringify(examText.nanjing[1], null, 2)

    {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'line')
      const res = geolocusContext.computeFuzzyLineObject('6号门路径')!
      addResult(geolocusContext, res)
      const regionList = res!.geoTripleResultList.map((res) => [
        res.region,
        res.coord,
      ])

      const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
      resultGridList.forEach((item, index) => {
        const region = regionList[index][0] as GeolocusObject
        if (!item || !region) return
        const pngBlob = generateBlobPng(item.grid!)
        const bbox = convertToWgs84(
          region.getGeometry().getBBox().slice(0, 2) as Position2,
        ).concat(
          convertToWgs84(
            region.getGeometry().getBBox().slice(2, 4) as Position2,
          ),
        )
        addImageToMap(map, region.getUUID() + 'pdfGird', pngBlob, bbox, 0.4)
      })

      const line = res?.result as GeolocusObject
      const line84 = toWgs84(geolocusContext.toGeoJSON(line))
      addGeoJSONToMap(map, line.getUUID() + 'result', line84, 'line', {
        'line-color': '#dc2626',
        'line-width': 3,
      })

      regionList.forEach((region) => {
        const [polygon, coord] = region as [GeolocusObject, Position2]
        const point84 = toWgs84(generatePointByCoord(coord))
        const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
        addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
          'circle-color': '#1447e6',
          'circle-radius': 6,
        })
        addGeoJSONToMap(map, polygon.getUUID() + 'region', polygon84, 'fill', {
          'fill-outline-color': '#15803d',
          'fill-color': '#007acc',
          'fill-opacity': 0.5,
        })
      })
    }
  }

  const nanjingXianPoint = () => {
    if (!map) return
    map.setCenter([118.9109, 32.1172])
    map.setZoom(17)

    const jsonText = JSON.stringify(examText.nanjing[2], null, 2)

    {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'point')
      const res = geolocusContext.computeFuzzyPointObject('学院报到点')!
      addResult(geolocusContext, res)
      const region = res.region as GeolocusObject
      const pdfGrid = res.regionPdfGrid as GeolocusGrid
      const grid = Array.from({ length: pdfGrid.length }, () =>
        new Array(pdfGrid[0].length).fill(0),
      )
      for (let i = 0; i < pdfGrid.length; i++) {
        for (let j = 0; j < pdfGrid[0].length; j++) {
          if (j <= 200) {
            grid[i][j] = pdfGrid[i][j]
          }
        }
      }
      const result = res.result as GeolocusObject
      const coord = result.getGeometry().getCenter() as Position2

      // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
      // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
      //   'fill-outline-color': '#15803d',
      //   'fill-color': '#4ade80',
      //   'fill-opacity': 0.5,
      // })

      const pngBlob = generateBlobPng(grid, 0.05)
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
    {
      const door: Position2[][] = [
        [
          [13237065.071367230266333, 3778708.855450590606779],
          [13237165.509100642055273, 3778711.412047438323498],
          [13237164.77864439971745, 3778678.541516505181789],
          [13237179.752997377887368, 3778676.350147776305676],
          [13237181.213909866288304, 3778653.706004243344069],
          [13237117.664216721430421, 3778653.706004243344069],
          [13237118.0294448453933, 3778685.846078935544938],
          [13237066.16705159470439, 3778685.115622692741454],
          [13237065.071367230266333, 3778708.855450590606779],
        ],
      ]
      const stop: Position2[][] = [
        [
          [13237061.227027628570795, 3778678.609107472002506],
          [13237099.924508998170495, 3778677.958729634061456],
          [13237099.924508998170495, 3778651.618427191395313],
          [13237061.227027628570795, 3778651.618427191395313],
          [13237061.227027628570795, 3778678.609107472002506],
        ],
      ]
      const doorJson = toWgs84(generatePolygonByCoordList(door))
      const stopJson = toWgs84(generatePolygonByCoordList(stop))
      addGeoJSONToMap(map, 'door', doorJson, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': '#4ade80',
        'fill-opacity': 0.5,
      })
      addGeoJSONToMap(map, 'stop', stopJson, 'fill', {
        'fill-outline-color': '#15803d',
        'fill-color': '#4ade80',
        'fill-opacity': 0.5,
      })
    }
  }

  const nanjingXianLine = () => {
    if (!map) return
    map.setCenter([118.9086, 32.1141])
    map.setZoom(15.8)

    const jsonText = JSON.stringify(examText.nanjing[3], null, 2)

    {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'line')
      const res = geolocusContext.computeFuzzyLineObject('仙林宾馆路径')!
      addResult(geolocusContext, res)
      const regionList = res!.geoTripleResultList.map((res) => [
        res.region,
        res.coord,
      ])

      const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
      resultGridList.forEach((item, index) => {
        const region = regionList[index][0] as GeolocusObject
        if (!item || !region) return
        const pngBlob = generateBlobPng(item.grid!)
        const bbox = convertToWgs84(
          region.getGeometry().getBBox().slice(0, 2) as Position2,
        ).concat(
          convertToWgs84(
            region.getGeometry().getBBox().slice(2, 4) as Position2,
          ),
        )
        addImageToMap(map, region.getUUID() + 'pdfGird', pngBlob, bbox, 0.3)
      })

      const line = res?.result as GeolocusObject
      const line84 = toWgs84(geolocusContext.toGeoJSON(line))
      addGeoJSONToMap(map, line.getUUID() + 'result', line84, 'line', {
        'line-color': '#dc2626',
        'line-width': 3,
      })

      regionList.forEach((region) => {
        const [polygon, coord] = region as [GeolocusObject, Position2]
        const point84 = toWgs84(generatePointByCoord(coord))
        const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
        addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
          'circle-color': '#1447e6',
          'circle-radius': 6,
        })
        addGeoJSONToMap(map, polygon.getUUID() + 'region', polygon84, 'fill', {
          'fill-outline-color': '#15803d',
          'fill-color': '#007acc',
          'fill-opacity': 0.5,
        })
      })
    }
  }

  const liaoshen = () => {
    if (!map) return
    map.setCenter([121.9109, 41.1172])
    map.setZoom(6.5)

    const jsonText = JSON.stringify(examText.liaoshen[0], null, 2)

    {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'point')
      const res = geolocusContext.computeFuzzyPointObject('4')!
      addResult(geolocusContext, res)
      console.log(res)
      const region = res.region as GeolocusObject
      const pdfGrid = res.regionPdfGrid as GeolocusGrid
      // const result = res.result as GeolocusObject

      // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
      // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
      //   'fill-outline-color': '#15803d',
      //   'fill-color': '#4ade80',
      //   'fill-opacity': 0.5,
      // })

      const pngBlob = generateBlobPng(pdfGrid, 0.05)
      const bbox = convertToWgs84(
        region.getGeometry().getBBox().slice(0, 2) as Position2,
      ).concat(
        convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
      )
      addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox, 0.6)

      // const coord = result.getGeometry().getCenter() as Position2
      // const coord84 = convertToWgs84(coord)
      // const point = generatePointByCoord(coord84)
      // addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
      //   'circle-color': '#dc2626',
      //   'circle-radius': 6,
      // })
    }
    // {
    //   const geolocusContext = initContext()
    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
    //   geolocusContext.defineRelation(tripleList, 'point')
    //   const res = geolocusContext.computeFuzzyPointObject('2')!
    //   addResult(geolocusContext, res)
    //   const region = res.region as GeolocusObject
    //   const pdfGrid = res.regionPdfGrid as GeolocusGrid
    //   const result = res.result as GeolocusObject
    //   const coord = result.getGeometry().getCenter() as Position2

    //   // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    //   // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
    //   //   'fill-outline-color': '#15803d',
    //   //   'fill-color': '#4ade80',
    //   //   'fill-opacity': 0.5,
    //   // })

    //   const pngBlob = generateBlobPng(pdfGrid, 0.05)
    //   const bbox = convertToWgs84(
    //     region.getGeometry().getBBox().slice(0, 2) as Position2,
    //   ).concat(
    //     convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
    //   )
    //   addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox, 0.6)
    //   const coord84 = convertToWgs84(coord)
    //   const point = generatePointByCoord(coord84)
    //   addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
    //     'circle-color': '#dc2626',
    //     'circle-radius': 6,
    //   })
    // }
    // {
    //   const geolocusContext = initContext()
    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
    //   geolocusContext.defineRelation(tripleList, 'point')
    //   const res = geolocusContext.computeFuzzyPointObject('3')!
    //   addResult(geolocusContext, res)
    //   const region = res.region as GeolocusObject
    //   const pdfGrid = res.regionPdfGrid as GeolocusGrid
    //   const result = res.result as GeolocusObject
    //   const coord = result.getGeometry().getCenter() as Position2

    //   // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    //   // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
    //   //   'fill-outline-color': '#15803d',
    //   //   'fill-color': '#4ade80',
    //   //   'fill-opacity': 0.5,
    //   // })

    //   const pngBlob = generateBlobPng(pdfGrid, 0.05)
    //   const bbox = convertToWgs84(
    //     region.getGeometry().getBBox().slice(0, 2) as Position2,
    //   ).concat(
    //     convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
    //   )
    //   addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox, 0.6)
    //   const coord84 = convertToWgs84(coord)
    //   const point = generatePointByCoord(coord84)
    //   addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
    //     'circle-color': '#dc2626',
    //     'circle-radius': 6,
    //   })
    // }
    // {
    //   const geolocusContext = initContext()
    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
    //   geolocusContext.defineRelation(tripleList, 'point')
    //   const res = geolocusContext.computeFuzzyPointObject('4')!
    //   addResult(geolocusContext, res)
    //   const region = res.region as GeolocusObject
    //   const pdfGrid = res.regionPdfGrid as GeolocusGrid
    //   const result = res.result as GeolocusObject
    //   const coord = result.getGeometry().getCenter() as Position2

    //   // const polygon84 = toWgs84(geolocusContext.toGeoJSON(region))
    //   // addGeoJSONToMap(map, region.getUUID() + 'region', polygon84, 'fill', {
    //   //   'fill-outline-color': '#15803d',
    //   //   'fill-color': '#4ade80',
    //   //   'fill-opacity': 0.5,
    //   // })

    //   const pngBlob = generateBlobPng(pdfGrid, 0.05)
    //   const bbox = convertToWgs84(
    //     region.getGeometry().getBBox().slice(0, 2) as Position2,
    //   ).concat(
    //     convertToWgs84(region.getGeometry().getBBox().slice(2, 4) as Position2),
    //   )
    //   addImageToMap(map, region.getUUID() + 'regionPdfGird', pngBlob, bbox, 0.6)
    //   const coord84 = convertToWgs84(coord)
    //   const point = generatePointByCoord(coord84)
    //   addGeoJSONToMap(map, result.getUUID() + 'result', point, 'circle', {
    //     'circle-color': '#dc2626',
    //     'circle-radius': 6,
    //   })
    // }
  }

  const shitoucheng = () => {
    if (!map) return
    map.setCenter([118.7479, 32.0531])
    map.setZoom(14.5)

    const jsonText = JSON.stringify(examText.qingliangshan[0], null, 2)
    const geolocusContext = initContext()
    const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
    geolocusContext.defineRelation(tripleList, 'line')
    const res = geolocusContext.computeFuzzyPolygonObject('石头城遗址')!
    addResult(geolocusContext, res)
    const regionList = res!.geoTripleResultList.map((res) => [
      res.region,
      res.coord,
    ])
    // regionList.forEach((region) => {
    //   const [polygon, coord] = region as [GeolocusObject, Position2]
    //   const point84 = toWgs84(generatePointByCoord(coord))
    //   const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
    //   addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
    //     'circle-color': '#403877',
    //   })
    //   addGeoJSONToMap(map, polygon.getUUID() + 'region', polygon84, 'fill', {
    //     'fill-outline-color': '#15803d',
    //     'fill-color': '#4ade80',
    //     'fill-opacity': 0.5,
    //   })
    // })

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

    const door: Position2[][] = [
      [
        [13218746.930763199925423, 3770365.412122709676623],
        [13218813.269302686676383, 3770443.457463278900832],
        [13218944.645625976845622, 3770459.066531393211335],
        [13219115.044619549065828, 3770503.292224381119013],
        [13219173.578624976798892, 3770551.4201843990013],
        [13219328.368550440296531, 3770578.736053596716374],
        [13219384.301044512540102, 3770260.050912942737341],
        [13219415.519180741161108, 3770109.163254509214312],
        [13219615.835554867982864, 3769925.106326333712786],
        [13219562.50457214564085, 3769896.489701458718628],
        [13219501.369055368006229, 3769875.027232802007347],
        [13219355.684419639408588, 3769746.252420862205327],
        [13219182.68391471169889, 3769884.1325225350447],
        [13219034.397767627611756, 3770038.922447994817048],
        [13218860.096507025882602, 3770218.426731305662543],
        [13218733.923206441104412, 3770347.20154324406758],
        [13218733.923206441104412, 3770347.20154324406758],
        [13218746.930763199925423, 3770365.412122709676623],
      ],
    ]
    const doorJson = toWgs84(generatePolygonByCoordList(door))
    addGeoJSONToMap(map, 'door', doorJson, 'fill', {
      'fill-outline-color': '#15803d',
      'fill-color': '#4ade80',
      'fill-opacity': 0.5,
    })

    // const polygon = res?.result as GeolocusObject
    // const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
    // addGeoJSONToMap(map, polygon.getUUID() + 'result', polygon84, 'fill', {
    //   'fill-outline-color': '#15803d',
    //   'fill-color': 'rgba(255, 0, 0, 0.3)',
    // })
  }

  const chishui = (name: string) => {
    if (!map) return
    map.setCenter([105.9086, 27.1141])
    map.setZoom(7)
    console.log(name)

    const jsonText = JSON.stringify(examText.chishui[0], null, 2)
    if (name === '5') {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'line')
      for (let i = 1; i <= 4; i++) {
        const res = geolocusContext.computeFuzzyLineObject(String(i))!
        addResult(geolocusContext, res)
        const regionList = res!.geoTripleResultList.map((res) => [
          res.region,
          res.coord,
        ])

        const line = res?.result as GeolocusObject
        const line84 = toWgs84(geolocusContext.toGeoJSON(line))
        const colorList = ['#fb2c36', '#00c950', '#ad46ff', '#f0b100']
        addGeoJSONToMap(map, line.getUUID() + 'result', line84, 'line', {
          'line-color': colorList[i - 1],
          'line-width': 3,
        })

        regionList.forEach((region) => {
          const [polygon, coord] = region as [GeolocusObject, Position2]
          const point84 = toWgs84(generatePointByCoord(coord))
          addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
            'circle-color': '#1447e6',
            'circle-radius': 4,
          })
        })
      }
    } else {
      const geolocusContext = initContext()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tripleList = JSON.parse(jsonText) as UserGeolocusTriple[]
      geolocusContext.defineRelation(tripleList, 'line')
      const res = geolocusContext.computeFuzzyLineObject(name)!
      addResult(geolocusContext, res)
      const regionList = res!.geoTripleResultList.map((res) => [
        res.region,
        res.coord,
      ])

      const resultGridList = res!.geoTripleResultList.map((res) => res.pdfGrid)
      resultGridList.forEach((item, index) => {
        const region = regionList[index][0] as GeolocusObject
        if (!item || !region) return
        const pngBlob = generateBlobPng(item.grid!, 0.005)
        const bbox = convertToWgs84(
          region.getGeometry().getBBox().slice(0, 2) as Position2,
        ).concat(
          convertToWgs84(
            region.getGeometry().getBBox().slice(2, 4) as Position2,
          ),
        )
        addImageToMap(map, region.getUUID() + 'pdfGird', pngBlob, bbox, 0.6)
      })

      const line = res?.result as GeolocusObject
      const line84 = toWgs84(geolocusContext.toGeoJSON(line))
      addGeoJSONToMap(map, line.getUUID() + 'result', line84, 'line', {
        'line-color': '#dc2626',
        'line-width': 3,
      })

      regionList.forEach((region) => {
        const [polygon, coord] = region as [GeolocusObject, Position2]
        const point84 = toWgs84(generatePointByCoord(coord))
        const polygon84 = toWgs84(geolocusContext.toGeoJSON(polygon))
        addGeoJSONToMap(map, polygon.getUUID() + 'coord', point84, 'circle', {
          'circle-color': '#1447e6',
          'circle-radius': 6,
        })
        addGeoJSONToMap(map, polygon.getUUID() + 'region', polygon84, 'fill', {
          'fill-outline-color': '#15803d',
          'fill-color': '#007acc',
          'fill-opacity': 0.5,
        })
      })
    }
  }

  const handleSubmit = async (content: string) => {
    if (geometryType.includes('exam')) {
      if (geometryType === 'exam1') {
        yangShanTest()
      } else if (geometryType === 'exam2') {
        xinjieoku()
      } else if (geometryType === 'exam3') {
        nanjingTemplate()
      } else if (geometryType === 'exam4') {
        nanjing6Point()
      } else if (geometryType === 'exam5') {
        nanjing6Line()
      } else if (geometryType === 'exam6') {
        nanjingXianPoint()
      } else if (geometryType === 'exam7') {
        nanjingXianLine()
      } else if (geometryType === 'exam8') {
        liaoshen()
      } else if (geometryType === 'exam9') {
        shitoucheng()
      } else {
        chishui(geometryType.replace('exam1', ''))
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
      xinjieoku()
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
