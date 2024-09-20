import { produce } from 'immer'
import { create } from 'zustand'

interface LayerStore {
  layerList: string[]
  addLayer: (value: string) => void
  removeLayer: (value: string) => void
  clearLayer: () => void
}

export const useLayerStore = create<LayerStore>((set) => ({
  layerList: [],
  addLayer: (value) => {
    set(
      produce((draft: LayerStore) => {
        draft.layerList.push(value)
      }),
    )
  },
  removeLayer: (value) => {
    set(
      produce((draft: LayerStore) => {
        draft.layerList.filter((id) => id !== value)
      }),
    )
  },
  clearLayer: () => {
    set({
      layerList: [],
    })
  },
}))
