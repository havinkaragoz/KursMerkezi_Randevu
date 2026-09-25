import emblem from '@/assets/hipokrat-emblem.png'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { text: 'text-base', icon: 22, sub: 'text-[8px]' },
  md: { text: 'text-2xl', icon: 32, sub: 'text-[10px]' },
  lg: { text: 'text-5xl sm:text-6xl', icon: 58, sub: 'text-sm' },
}

const WORDMARK_CLASS = 'flex items-center font-heading font-extrabold tracking-tight'

function Wordmark({ s, tone }) {
  return (
    <div className={cn(WORDMARK_CLASS, s.text, tone === 'light' ? 'text-brand-anthracite-foreground' : 'text-brand-anthracite')}>
      <span>HİP</span>
      <img
        src={emblem}
        alt=""
        width={s.icon}
        height={s.icon}
        className="mx-0.5 inline-block shrink-0"
        style={{ width: s.icon, height: s.icon }}
      />
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
