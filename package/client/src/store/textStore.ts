import { create } from 'zustand'

interface textStore {
  aiText: string | null
  jsonText: string | null
  setAiText: (value: string | null) => void
  getAiText: () => string | null
  clearAiText: () => void
  setJsonText: (value: string | null) => void
  getJsonText: () => string | null
  clearJsonText: () => void
}

export const useTextStore = create<textStore>((set, get) => ({
  aiText: null,
  jsonText: null,
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
