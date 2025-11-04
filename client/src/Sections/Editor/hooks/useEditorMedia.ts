import { useCallback, useState } from 'react'

import type { DroppedFile } from '../types'

const getFileKind = (file: File): DroppedFile['kind'] => {
  if (file.type.startsWith('video')) return 'video'
  if (file.type.startsWith('image')) return 'image'
  return 'image'
}

const toDroppedFiles = (fileList: FileList): DroppedFile[] =>
  Array.from(fileList).map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    url: URL.createObjectURL(file),
    kind: getFileKind(file),
  }))

export const useEditorMedia = () => {
  const [files, setFiles] = useState<DroppedFile[]>([])
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)

  const addFiles = useCallback((fileList: FileList) => {
    const next = toDroppedFiles(fileList)

    setFiles((prev) => {
      const updated = [...prev, ...next]

      setActiveVideoUrl((current) => {
        if (current) return current
        const firstVideo = updated.find((file) => file.kind === 'video')
        return firstVideo ? firstVideo.url : null
      })

      return updated
    })
  }, [])

  return {
    files,
    activeVideoUrl,
    addFiles,
    setActiveVideoUrl,
  }
}

