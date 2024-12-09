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

interface JsonMessage {
  content: string
  userName: string
}

interface MessageStore {
  chatMessageList: ChatMessage[]
  jsonMessageList: JsonMessage[]
  setChatMessageList: (value: ChatMessage[]) => void
  addChatMessage: (value: ChatMessage) => void
  updateChatMessageList: (index: number, value: ChatMessage) => void
  getChatMessageList: () => ChatMessage[]
  clearChatMessageList: () => void
  setJsonMessageList: (value: JsonMessage[]) => void
  addJsonMessage: (value: JsonMessage) => void
  updateJsonMessageList: (index: number, value: JsonMessage) => void
  getJsonMessageList: () => JsonMessage[]
  clearJsonMessageList: () => void
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  chatMessageList: [],
  jsonMessageList: [],
  setChatMessageList: (value: ChatMessage[]) => {
    set({
      chatMessageList: value,
    })
  },
  addChatMessage: (value: ChatMessage) => {
    set(
      produce((draft: MessageStore) => {
        draft.chatMessageList.push(value)
      }),
    )
  },
  updateChatMessageList: (index: number, value: ChatMessage) => {
    set(
      produce((draft: MessageStore) => {
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
  setJsonMessageList: (value: JsonMessage[]) => {
    set({
      jsonMessageList: value,
    })
  },
  addJsonMessage: (value: JsonMessage) => {
    set(
      produce((draft: MessageStore) => {
        draft.jsonMessageList.push(value)
      }),
    )
  },
  updateJsonMessageList: (index: number, value: JsonMessage) => {
    set(
      produce((draft: MessageStore) => {
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
