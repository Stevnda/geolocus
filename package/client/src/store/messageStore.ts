import { produce } from 'immer'
import { create } from 'zustand'

export interface ChatMessage {
  content: string
  timestamp: Date
  userName: string
  type: 'prompt' | 'user' | 'json' | 'computation'
  isDone: boolean
  avatar: string
}

interface jsonMessage {
  content: string
  userName: string
}

interface messageStore {
  chatMessageList: ChatMessage[]
  jsonMessageList: jsonMessage[]
  setChatMessageList: (value: ChatMessage[]) => void
  addChatMessage: (value: ChatMessage) => void
  updateChatMessageList: (index: number, value: ChatMessage) => void
  getChatMessageList: () => ChatMessage[]
  clearChatMessageList: () => void
  setJsonMessageList: (value: jsonMessage[]) => void
  addJsonMessage: (value: jsonMessage) => void
  updateJsonMessageList: (index: number, value: jsonMessage) => void
  getJsonMessageList: () => jsonMessage[]
  clearJsonMessageList: () => void
}

export const useMessageStore = create<messageStore>((set, get) => ({
  chatMessageList: [],
  jsonMessageList: [],
  setChatMessageList: (value: ChatMessage[]) => {
    set({
      chatMessageList: value,
    })
  },
  addChatMessage: (value: ChatMessage) => {
    set(
      produce((draft: messageStore) => {
        draft.chatMessageList.push(value)
      }),
    )
  },
  updateChatMessageList: (index: number, value: ChatMessage) => {
    set(
      produce((draft: messageStore) => {
        draft.chatMessageList[index] = value
      }),
    )
  },
  getChatMessageList: () => {
    return get().chatMessageList
  },
  clearChatMessageList: () => {
    set({
      chatMessageList: [],
    })
  },
  setJsonMessageList: (value: jsonMessage[]) => {
    set({
      jsonMessageList: value,
    })
  },
  addJsonMessage: (value: jsonMessage) => {
    set(
      produce((draft: messageStore) => {
        draft.jsonMessageList.push(value)
      }),
    )
  },
  updateJsonMessageList: (index: number, value: jsonMessage) => {
    set(
      produce((draft: messageStore) => {
        draft.jsonMessageList[index] = value
      }),
    )
  },
  getJsonMessageList: () => {
    return get().jsonMessageList
  },
  clearJsonMessageList: () => {
    set({
      jsonMessageList: [],
    })
  },
}))
