import { useMapStore } from '@/store/mapStore'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import { MapStatus } from './MapStatus'
import { debounce } from 'es-toolkit'

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
      'REMOVED_MAPBOX_ACCESS_TOKEN'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current, // map 容器
      style: 'mapbox://styles/mapbox/streets-v12', // map 底图
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
