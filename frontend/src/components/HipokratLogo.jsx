import { Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { text: 'text-base', icon: 14, iconBox: 'size-5 border-2', sub: 'text-[8px]' },
  md: { text: 'text-2xl', icon: 20, iconBox: 'size-8 border-[3px]', sub: 'text-[10px]' },
  lg: { text: 'text-4xl sm:text-5xl', icon: 30, iconBox: 'size-11 sm:size-13 border-[3px]', sub: 'text-xs' },
}

const WORDMARK_CLASS = 'flex items-center font-heading font-extrabold tracking-tight'

function Wordmark({ s, tone }) {
  return (
    <div className={cn(WORDMARK_CLASS, s.text, tone === 'light' ? 'text-brand-anthracite-foreground' : 'text-foreground')}>
      <span>HİP</span>
      <span
        className={cn(
          'mx-0.5 inline-flex items-center justify-center rounded-full border-brand-gold text-brand-gold',
          s.iconBox,
        )}
      >
        <Landmark size={s.icon} strokeWidth={2.5} />
      </span>
      <span>KRAT</span>
    </div>
  )
}

/**
 * variant "full" — icon + wordmark + underline + tagline, for surfaces with room to breathe
 * (login screen). variant "compact" — icon + wordmark only, for persistent app chrome
 * (the anthracite sidebar) where the tagline would just add noise — wordmark text renders
 * light since it always sits on the dark sidebar, regardless of the app's light/dark theme.
 */
export function HipokratLogo({ size = 'md', variant = 'full', className }) {
  const s = SIZES[size] ?? SIZES.md

  if (variant === 'compact') {
    return (
      <div className={cn('flex', className)}>
        <Wordmark s={s} tone="light" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <Wordmark s={s} />
      <div className="mt-0.5 h-0.5 w-full bg-brand-gold" />
      <p className={cn('mt-1 font-semibold tracking-wide text-brand-gold', s.sub)}>
        EĞİTİM &amp; DANIŞMANLIK VE KÜTÜPHANE
      </p>
    </div>
  )
}
