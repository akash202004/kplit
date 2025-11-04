import { memo } from 'react'
// import type { LucideIcon } from 'lucide-react' // No longer needed
// import { Sparkles, Wand2, Timer, ShieldCheck, PenTool } from 'lucide-react' // No longer needed
import { cn } from '../lib/utils'

type Feature = {
  title: string
  description: string
  // icon: LucideIcon // Removed
  layout?: string
  accent?: string
  // iconColor?: string // Removed
}

const features: Feature[] = [
  {
    title: 'AI-Powered Editing',
    description:
      'Generate polished video drafts with context-aware trim, captions, and pacing suggestions.',
    // icon: Sparkles, // Removed
    layout: 'md:col-span-2 md:row-span-2',
    accent: 'from-purple-500/20 via-purple-400/10 to-transparent',
    // iconColor: 'text-purple-300', // Removed
  },
  {
    title: 'Adaptive Storyboards',
    description:
      'Transform scripts into intelligent shot lists that adapt as you edit your footage.',
    // icon: PenTool, // Removed
    layout: '',
    accent: 'from-blue-500/20 via-blue-400/10 to-transparent',
    // iconColor: 'text-blue-300', // Removed
  },
  {
    title: 'Smart Automation',
    description:
      'Automate repetitive edits with workflows tailored to your style and content goals.',
    // icon: Timer, // Removed
    layout: '',
    accent: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    // iconColor: 'text-emerald-300', // Removed
  },
  {
    title: 'Consistent Branding',
    description:
      'Keep every deliverable on-brand with reusable motion graphics, color presets, and fonts.',
    // icon: Wand2, // Removed
    layout: '',
    accent: 'from-amber-500/20 via-amber-400/10 to-transparent',
    // iconColor: 'text-amber-300', // Removed
  },
  {
    title: 'Collaborative Review',
    description:
      'Share secure review links with frame-accurate annotations and version history.',
    // icon: ShieldCheck, // Removed
    layout: '',
    accent: 'from-slate-500/20 via-slate-400/10 to-transparent',
    // iconColor: 'text-slate-300', // Removed
  },
]

type BentoCardProps = {
  feature: Feature
  className?: string
}

const BentoCard = ({ feature, className }: BentoCardProps) => {
  const { title, description, accent } = feature

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 hover:border-white/10',
        className
      )}
    >
      <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
        <div className={cn('absolute inset-0 bg-gradient-to-br blur-2xl', accent)} />
      </div>

      <div>
        <h3 className='mt-4 text-lg font-semibold text-white'>{title}</h3>
        <p className='mt-2 text-sm text-white/70'>{description}</p>
      </div>
      <span className='mt-4 text-xs font-semibold uppercase tracking-wide text-white/50'>
        Explore
      </span>
    </article>
  )
}

const BentoDemoComponent = () => {
  return (
    <section className='flex min-h-screen items-center justify-center bg-black/20 py-16'>
      <div className='mx-auto w-full max-w-6xl px-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[220px]'>
          {features.map((feature) => (
            <BentoCard
              key={feature.title}
              feature={feature}
              className={feature.layout}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const BentoDemo = memo(BentoDemoComponent)

export { BentoDemo }
export default BentoDemo

