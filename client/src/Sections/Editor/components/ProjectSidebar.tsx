import type { FC } from 'react'

import type { LibraryItem } from '../types'

type ProjectSidebarProps = {
  libraryItems: LibraryItem[]
}

const ProjectSidebar: FC<ProjectSidebarProps> = ({ libraryItems }) => (
  <aside className='hidden w-60 flex-col border-r border-white/10 bg-[#10141a] text-sm text-zinc-300 md:flex'>
    <div className='border-b border-white/5 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500'>
      Project Media
    </div>
    <div className='flex-1 overflow-auto px-5 py-4'>
      <div className='mb-6 flex items-center justify-between text-xs text-zinc-400'>
        <span>Shared Project</span>
        <span className='rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide'>Sync On</span>
      </div>
      <ul className='space-y-3'>
        {libraryItems.map((item) => (
          <li
            key={item.name}
            className='flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white'
          >
            <span>{item.name}</span>
            <span className='rounded bg-black/40 px-2 py-0.5 text-[10px]'>{item.count}</span>
          </li>
        ))}
      </ul>
      <div className='mt-8 space-y-3 text-xs text-zinc-500'>
        <p className='uppercase tracking-[0.3em] text-[10px] text-zinc-600'>Markers</p>
        <div className='space-y-2'>
          <button className='w-full rounded border border-white/10 px-3 py-2 text-left transition-colors hover:border-purple-500/40 hover:text-white'>
            Beat Detection
          </button>
          <button className='w-full rounded border border-white/10 px-3 py-2 text-left transition-colors hover:border-purple-500/40 hover:text-white'>
            Audio Stretch
          </button>
        </div>
      </div>
    </div>
  </aside>
)

export default ProjectSidebar

