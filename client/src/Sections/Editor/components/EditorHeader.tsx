import type { FC } from 'react'

const EditorHeader: FC = () => (
  <header className='border-b border-white/10 bg-[#181c21]'>
    <div className='flex flex-wrap items-center justify-between gap-4 px-6 py-3 text-sm'>
      <div className='flex items-center gap-3'>
        <div className='grid h-9 w-9 place-items-center rounded-md bg-purple-600/80 text-base font-semibold text-black'>
          VC
        </div>
        <div>
          <p className='text-base font-semibold tracking-wide'>VideoCurse Studio</p>
          <p className='text-xs text-zinc-400'>Untitled • 00:00:00:00</p>
        </div>
      </div>
    </div>
  </header>
)

export default EditorHeader

