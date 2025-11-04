export const EDITOR_MEDIA_DRAG_DATA_KEY = 'videocurse/editor-media-id'

export type DroppedFile = {
  id: string
  file: File
  url: string
  kind: 'video' | 'image'
}

export type LibraryItem = {
  name: string
  count: number
}

export type TimelineClip = {
  id: string
  fileId: DroppedFile['id']
  name: string
  start: number
  duration: number
  url: string
}

export type AssistantMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

