import { create } from 'zustand'

interface textStore {
  type: 'point' | 'line' | 'polygon'
  aiText: string | null
  jsonText: string | null
  setType: (value: 'point' | 'line' | 'polygon') => void
  setAiText: (value: string | null) => void
  getAiText: () => string | null
  clearAiText: () => void
  setJsonText: (value: string | null) => void
  getJsonText: () => string | null
  clearJsonText: () => void
}

export const useTextStore = create<textStore>((set, get) => ({
  type: 'line',
  aiText: null,
  jsonText: null,
  setType: (value) => {
    set({
      type: value,
    })
  },
  setAiText: (value) => {
    set({
      aiText: value,
    })
  },
  getAiText: () => {
    return get().aiText
  },
  clearAiText: () => {
    set({
      aiText: null,
    })
  },
  setJsonText: (value) => {
    set({
      jsonText: value,
    })
  },
  getJsonText: () => {
    return get().jsonText
  },
  clearJsonText: () => {
    set({
      jsonText: null,
    })
  },
}))
