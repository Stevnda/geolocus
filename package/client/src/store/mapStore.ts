import { create } from 'zustand'

interface MapStore {
  map: mapboxgl.Map | null
  mapPosition: [number, number, number]
  clickPosition: [number, number]
  setMap: (value: mapboxgl.Map) => void
  setMapPosition: (value: [number, number, number]) => void
  setClickPosition: (value: [number, number]) => void
}

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  // mapPosition: [118.9089, 32.1161, 16.5],
  mapPosition: [114.5382, 9.8379, 3.5],
  clickPosition: [0, 0],
  setMap: (value) => set({ map: value }),
  setMapPosition: (value) => set({ mapPosition: value }),
  setClickPosition: (value) => set({ clickPosition: value }),
}))
