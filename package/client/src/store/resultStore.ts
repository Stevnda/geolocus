import { Geolocus, RegionResult } from '@geolocus/core'
import { produce } from 'immer'
import { create } from 'zustand'

export interface Result {
  context: Geolocus
  result: RegionResult
}

interface ResultStore {
  resultList: Result[]
  setResultList: (resultList: Result[]) => void
  addResult: (context: Geolocus, result: RegionResult) => void
  getResultList: () => Result[]
}

export const useResultStore = create<ResultStore>((set, get) => ({
  resultList: [],
  setResultList: (resultList: Result[]) => set({ resultList }),
  addResult: (context: Geolocus, result: RegionResult) => {
    set(
      produce((draft: ResultStore) => {
        draft.resultList.push({ context, result })
      }),
    )
  },
  getResultList: () => {
    return get().resultList
  },
}))
