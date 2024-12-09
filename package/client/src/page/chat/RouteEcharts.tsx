/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/namespace */
import { Result } from '@/store/resultStore'
import * as echarts from 'echarts'
import { debounce } from 'es-toolkit'
import { useEffect, useRef } from 'react'

const generateEchartsGraphDataFromRoute = (result: Result) => {
  const nodeMap = result.context.getContext().getRoute().getNodeList()
  const uuidMap = result.context.getContext().getObjectMap().getUUIDMap()

  // Calculate node positions in a tree layout
  const nodePositions = new Map<string, { x: number; y: number }>()
  const nodesAtLevel = new Map<number, string[]>()

  // First pass: Group nodes by level
  for (const [nodeId, node] of nodeMap.entries()) {
    const level = node.getLevel()
    if (!nodesAtLevel.has(level)) {
      nodesAtLevel.set(level, [])
    }
    nodesAtLevel.get(level)?.push(nodeId)
  }

  // Second pass: Position nodes at each level
  const horizontalSpacing = 100
  const verticalSpacing = 200

  nodesAtLevel.forEach((nodes, level) => {
    const totalWidth = (nodes.length - 1) * horizontalSpacing
    const startX = -totalWidth / 2

    nodes.forEach((nodeId, index) => {
      nodePositions.set(nodeId, {
        x: startX + index * horizontalSpacing,
        y: level * verticalSpacing,
      })
    })
  })

  // Create node list with calculated positions
  const nodeList = Array.from(nodeMap.entries()).map(([nodeId, node]) => {
    const pos = nodePositions.get(nodeId) || { x: 0, y: 0 }
    const level = node.getLevel()

    return {
      id: nodeId,
      name:
        uuidMap.get(nodeId)?.getName() || result.context.getContext().getName(),
      category: level,
      x: pos.x,
      y: pos.y,
      symbolSize:
        20 + (node.getInNodeMap().size + node.getOutNodeMap().size) * 2,
      itemStyle: {
        color: `hsl(${(level * 60) % 360}, 70%, 50%)`,
      },
    }
  })

  // Create edge list with curved lines
  const edgeList = []
  for (const [nodeId, node] of nodeMap.entries()) {
    const outNodeMap = node.getOutNodeMap()
    for (const [outNodeId, relationType] of outNodeMap.entries()) {
      edgeList.push({
        source: nodeId,
        target: outNodeId,
        type: Array.from(relationType).map((type) => {
          if (type === 'calculation') return '计算关系'
          if (type === 'association') return '关联关系'
          return '隶属关系'
        }),
        lineStyle: {
          width: 3,
          curveness: 0.1,
          color: '#f87171',
        },
      })
    }
  }

  // Get unique categories
  const categories = new Set<number>()
  for (const node of nodeMap.values()) {
    categories.add(node.getLevel())
  }

  return {
    nodeList,
    edgeList,
    categories: Array.from(categories).map((level) => ({
      name: level.toString(),
    })),
  }
}

interface RouteEchartsProps {
  result: Result
}

export const RouteEcharts = ({ result }: RouteEchartsProps) => {
  const echartsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!echartsRef.current) return

    const chart = echarts.init(echartsRef.current)
    const data = generateEchartsGraphDataFromRoute(result)

    const option = {
      title: {
        text: '对象间的关系图',
      },
      tooltip: {
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `对象层级: ${params.data.category}<br/>名称: ${params.data.name}`
          } else if (params.dataType === 'edge') {
            return `${params.data.type.join(', ')}`
          }
          return ''
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          animation: false,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: 12,
          },
          draggable: true,
          data: data.nodeList,
          edges: data.edgeList,
          categories: data.categories,
          roam: true,
          zoom: 0.8,
          emphasis: {
            focus: 'adjacency',
          },
          edgeSymbol: [null, 'arrow'],
        },
      ],
    }

    chart.setOption(option)

    chart.on('click', (params: any) => {
      console.log(params)
    })

    const resizeObserver = new ResizeObserver(
      debounce(() => {
        chart.resize()
      }, 300),
    )
    resizeObserver.observe(echartsRef.current)

    return () => {
      chart.dispose()
    }
  }, [])

  return (
    <div className="flex h-full items-center justify-center">
      <div
        ref={echartsRef}
        className="h-full w-full rounded-lg border border-slate-300 p-4"
      ></div>
    </div>
  )
}
