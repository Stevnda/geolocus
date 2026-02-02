import { useMapStore } from '@/store/mapStore'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import { MapStatus } from './MapStatus'
import { debounce } from 'es-toolkit'

const tk = 'REDACTED_TIANDITU_TOKEN'
const sources = {
  'osm-tiles1': {
    type: 'raster' as const,
    tiles: [
      `http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`,
    ],
    tileSize: 256,
  },
  'osm-tiles2': {
    type: 'raster' as const,
    tiles: [
      `http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tk}`,
    ],
    tileSize: 256,
  },
} satisfies mapboxgl.SourcesSpecification
const layers = [
  {
    id: 'simple-tiles1',
    type: 'raster' as const,
    source: 'osm-tiles1',
  },
  // {
  //   id: 'simple-tiles2',
  //   type: 'raster',
  //   source: 'osm-tiles2',
  // },
] satisfies mapboxgl.LayerSpecification[]

export const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(document.createElement('div'))
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const map = useMapStore((state) => state.map)
  const setMap = useMapStore((state) => state.setMap)
  const position = useMapStore((state) => state.mapPosition)
  const setPosition = useMapStore((state) => state.setMapPosition)
  const setClickPosition = useMapStore((state) => state.setClickPosition)

  useEffect(() => {
    // init map
    if (mapRef.current) return

    mapboxgl.accessToken =
      'REDACTED_MAPBOX_TOKEN'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current, // map 容器
      style: {
        version: 8,
        sources,
        layers,
      },
      center: [position[0], position[1]], // map 初始化中心位置
      zoom: position[2], // map 初始化缩放级别
    })
    mapRef.current.addControl(
      new MapboxLanguage({
        defaultLanguage: 'zh-Hans',
      }),
    )
    setMap(mapRef.current)

    const resizeObserver = new ResizeObserver(
      debounce(() => {
        mapRef.current?.resize()
      }, 300),
    )
    resizeObserver.observe(mapContainerRef.current)

    mapRef.current.on('resize', () => {
      console.log('A resize event occurred.')
    })

    mapRef.current.on('load', () => {
      // add source
    })

    // update map center position
    mapRef.current.on('move', () => {
      if (mapRef.current) {
        setPosition([
          Number(mapRef.current.getCenter().lng.toFixed(4)),
          Number(mapRef.current.getCenter().lat.toFixed(4)),
          Number(mapRef.current.getZoom().toFixed(2)),
        ])
      }
    })

    mapRef.current.on('click', (e) => {
      setClickPosition(e.lngLat.toArray() as [number, number])
    })
  }, [])

  useEffect(() => {
    if (map) map.resize()
  }, [])

  return (
    <div className="h-full w-full">
      <MapStatus position={position}></MapStatus>
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  )
}
