import { Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { text: 'text-base', icon: 14, iconBox: 'size-5 border-2', sub: 'text-[8px]' },
  md: { text: 'text-2xl', icon: 20, iconBox: 'size-8 border-[3px]', sub: 'text-[10px]' },
  lg: { text: 'text-4xl sm:text-5xl', icon: 30, iconBox: 'size-11 sm:size-13 border-[3px]', sub: 'text-xs' },
}

export function HipokratLogo({ size = 'md', className }) {
  const s = SIZES[size] ?? SIZES.md

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div
        className={cn(
          'flex items-center font-heading font-extrabold tracking-tight text-foreground',
          s.text,
        )}
      >
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
      <div className="mt-0.5 h-0.5 w-full bg-brand-gold" />
      <p className={cn('mt-1 font-semibold tracking-wide text-brand-gold', s.sub)}>
        EĞİTİM &amp; DANIŞMANLIK VE KÜTÜPHANE
      </p>
    </div>
  )
}
