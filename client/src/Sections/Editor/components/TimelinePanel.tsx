import { useCallback, useMemo, useState } from 'react'
import type { DragEvent, FC } from 'react'

import { EDITOR_MEDIA_DRAG_DATA_KEY, type TimelineClip } from '../types'

type TimelinePanelProps = {
  timelineTicks: number[]
  waveform: number[]
  clips: TimelineClip[]
  onDropClip: (fileId: string) => void
}

const toTimeLabel = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const TIMELINE_HEIGHT = 'h-56'

const TimelinePanel: FC<TimelinePanelProps> = ({ timelineTicks, waveform, clips, onDropClip }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const maxTick = useMemo(() => Math.max(timelineTicks[timelineTicks.length - 1] ?? 1, 1), [timelineTicks])

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDragEnter = useCallback(() => {
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDraggingOver(false)

      const fileId =
        event.dataTransfer.getData(EDITOR_MEDIA_DRAG_DATA_KEY) || event.dataTransfer.getData('text/plain')
      if (!fileId) return

      onDropClip(fileId)
      event.dataTransfer.clearData()
    },
    [onDropClip]
  )

  return (
    <div className={`flex-none border-t border-white/10 bg-[#11141a] ${TIMELINE_HEIGHT}`}>
      <div className='flex items-center justify-between border-b border-white/5 px-6 py-3 text-xs text-zinc-400'>
        <div className='flex items-center gap-4'>
          <span className='rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-zinc-500'>Timeline</span>
          <button className='rounded border border-white/10 px-2 py-1 text-xs transition-colors hover:border-purple-500/40 hover:text-white'>
            + Track
          </button>
        </div>
        <div className='flex items-center gap-6'>
          <span>00:00:00:00</span>
          <span className='rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide'>100%</span>
        </div>
      </div>
      <div className='h-full px-6 py-4 text-xs text-zinc-400'>
        <div className='relative mb-4 h-6 border-b border-white/5'>
          {timelineTicks.map((tick) => {
            const position = (tick / maxTick) * 100

            return (
              <div key={tick} className='absolute flex flex-col items-center' style={{ left: `${position}%` }}>
                <span className='h-4 w-px bg-white/20'></span>
                <span className='mt-1 text-[10px]'>{toTimeLabel(tick)}</span>
              </div>
            )
          })}
        </div>
        <div className='space-y-3'>
          <div className='rounded-lg border border-white/10 bg-[#0c0f14] p-3'>
            <div className='mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-zinc-500'>
              <span>Video 1</span>
              <span>V1</span>
            </div>
            <div className='flex h-16 items-center gap-2'>
              <div
                className={`relative flex h-full flex-1 rounded border border-white/10 bg-[#10141b] transition-colors ${
                  isDraggingOver ? 'border-purple-400/70 bg-purple-500/10' : ''
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {clips.length === 0 && (
                  <div className='pointer-events-none absolute inset-0 grid place-items-center text-[11px] text-zinc-500'>
                    Drop videos here
                  </div>
                )}

                {clips.map((clip) => {
                  const startPercent = (clip.start / maxTick) * 100
                  const widthPercent = (clip.duration / maxTick) * 100
                  const finalWidth = Math.max(Math.min(widthPercent, 100 - startPercent), 1)

                  return (
                    <div
                      key={clip.id}
                      className='absolute top-2 bottom-2 rounded border border-purple-500/60 bg-purple-500/50 px-3 py-1 text-[11px] text-black/80 shadow-lg shadow-purple-500/10 backdrop-blur-sm'
                      style={{ left: `${startPercent}%`, width: `${finalWidth}%`, minWidth: '72px' }}
                    >
                      <p className='truncate font-medium'>{clip.name}</p>
                      <p className='text-[10px] uppercase tracking-wide text-black/60'>
                        {toTimeLabel(clip.start)} - {toTimeLabel(clip.start + clip.duration)}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className='w-10 rounded bg-white/10 text-center text-[10px] uppercase tracking-wide text-white'>FX</div>
            </div>
          </div>
          <div className='rounded-lg border border-white/10 bg-[#0c0f14] p-3'>
            <div className='mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-zinc-500'>
              <span>Audio 1</span>
              <span>A1</span>
            </div>
            <div className='flex h-16 items-end gap-0.5 overflow-hidden rounded bg-black/40 p-2'>
              {waveform.map((height, index) => (
                <span
                  key={index}
                  className='w-[2px] rounded bg-purple-400/70'
                  style={{ height: `${Math.max(10, height)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelinePanel