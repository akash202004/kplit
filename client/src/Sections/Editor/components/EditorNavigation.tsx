import type { FC } from 'react'

type EditorNavigationProps = {
  navItems: string[]
  activeIndex?: number
}

const EditorNavigation: FC<EditorNavigationProps> = ({ navItems, activeIndex = 0 }) => (
  <nav className='border-b border-white/10 bg-[#14181d]'>
    <div className='flex items-center gap-6 px-6 py-2 text-sm'>
      {navItems.map((item, index) => (
        <button
          key={item}
          className={`pb-2 transition-colors ${index === activeIndex ? 'border-b-2 border-purple-400 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          {item}
        </button>
      ))}
    </div>
  </nav>
)

export default EditorNavigation

