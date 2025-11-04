import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FC, FormEvent } from 'react'

import type { AssistantMessage, DroppedFile } from '../types'

const QUICK_ACTIONS = ['Trim intro', 'Stabilize shaky footage', 'Fix color balance']

type AssistantPanelProps = {
  messages: AssistantMessage[]
  videoFiles: DroppedFile[]
  defaultVideoId?: string | null
  isProcessing?: boolean
  error?: string | null
  onSubmit: (options: { prompt: string; videoFile: DroppedFile }) => Promise<void> | void
}

const AssistantPanel: FC<AssistantPanelProps> = ({
  messages,
  videoFiles,
  defaultVideoId,
  isProcessing = false,
  error,
  onSubmit,
}) => {
  const [prompt, setPrompt] = useState('')
  const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>()
  const [localError, setLocalError] = useState<string | null>(null)

  const hasVideos = videoFiles.length > 0

  useEffect(() => {
    if (!hasVideos) {
      setSelectedVideoId(undefined)
      return
    }

    if (defaultVideoId && videoFiles.some((file) => file.id === defaultVideoId)) {
      setSelectedVideoId(defaultVideoId)
      return
    }

    setSelectedVideoId((current) => (current && videoFiles.some((file) => file.id === current) ? current : videoFiles[0]?.id))
  }, [defaultVideoId, hasVideos, videoFiles])

  useEffect(() => {
    setLocalError(error ?? null)
  }, [error])

  const selectedVideo = useMemo(() => videoFiles.find((file) => file.id === selectedVideoId), [selectedVideoId, videoFiles])

  const handleQuickAction = useCallback((action: string) => {
    setPrompt(action)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!hasVideos) {
      setLocalError('Upload a video in the media panel to get started.')
      return
    }

    if (!selectedVideo) {
      setLocalError('Select a video clip to edit.')
      return
    }

    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setLocalError('Describe the edit you want me to apply.')
      return
    }

    setLocalError(null)

    try {
      await onSubmit({ prompt: trimmedPrompt, videoFile: selectedVideo })
      setPrompt('')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to submit request'
      setLocalError(message)
    }
  }, [hasVideos, onSubmit, prompt, selectedVideo])

  const handleFormSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await handleSubmit()
    },
    [handleSubmit],
  )

  return (
    <aside className='hidden h-full flex-col border-l border-white/10 bg-[#090c12] text-sm text-zinc-300 lg:flex lg:min-h-[520px] lg:w-80'>
      <div className='border-b border-white/5 px-5 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-purple-300'>
        Assistant
      </div>

      <div className='flex-1 overflow-auto space-y-4 px-5 py-4'>
        {messages.length === 0 ? (
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-100'>
            Upload a video in the media panel and describe the edit you want. I will send the request to the AI
            pipeline and show the output here.
          </div>
        ) : (
          messages.map(({ id, role, content }) => (
            <div
              key={id}
              className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
                role === 'assistant'
                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-100'
                  : 'border-white/10 bg-white/5 text-zinc-100'
              }`}
            >
              <p className='text-xs uppercase tracking-wide text-zinc-400'>{role === 'assistant' ? 'Assistant' : 'You'}</p>
              <p className='mt-2 break-words whitespace-pre-wrap'>{content}</p>
            </div>
          ))
        )}
      </div>

      <div className='border-t border-white/5 px-5 py-4'>
        <div className='mb-3 flex flex-wrap gap-2'>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type='button'
              className='rounded-full border border-purple-500/40 px-3 py-1 text-xs text-purple-200 transition-colors hover:border-purple-400 hover:bg-purple-500/10 hover:text-white'
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        <form className='space-y-3 rounded-lg border border-white/10 bg-[#0f131a] p-3' onSubmit={handleFormSubmit}>
          <div className='space-y-2'>
            <label className='block text-xs font-medium text-zinc-400'>Video to edit</label>
            <select
              className='w-full rounded-md border border-white/10 bg-[#090c12] px-3 py-2 text-xs text-zinc-100 focus:border-purple-500/60 focus:outline-none'
              value={selectedVideoId ?? ''}
              onChange={(event) => setSelectedVideoId(event.target.value || undefined)}
              disabled={!hasVideos || isProcessing}
            >
              {!hasVideos && <option value=''>Upload a video first</option>}
              {videoFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.file.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            placeholder='Describe the changes you want (e.g., "Trim first 10 seconds and boost brightness by 15%")'
            className='w-full resize-none rounded-md border border-white/10 bg-[#090c12] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500/60 focus:outline-none'
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isProcessing}
          />

          {localError && <p className='text-xs text-red-400'>{localError}</p>}

          <button
            type='submit'
            className='w-full rounded-md bg-purple-500/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-70'
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing…' : 'Send to AI'}
          </button>
        </form>
      </div>
    </aside>
  )
}

export default AssistantPanel