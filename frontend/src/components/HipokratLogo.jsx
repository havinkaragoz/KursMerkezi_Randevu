import emblemWhite from '@/assets/hipokrat-emblem-white.png'
import fullLogo from '@/assets/hipokrat-full-logo.png'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { text: 'text-base', icon: 22 },
  md: { text: 'text-2xl', icon: 32 },
  lg: { text: 'text-5xl sm:text-6xl', icon: 58 },
}

const FULL_WIDTHS = {
  sm: 'w-48',
  md: 'w-64',
  lg: 'w-72 sm:w-80',
}

/**
 * variant "full" — the real HİPOKRAT lockup image (wordmark + emblem + underline + tagline,
 * letters shaped around the icon) for surfaces with room to breathe (login screen). Rendered
 * as a single asset rather than recomposed from text, since the P/K letterforms are custom-cut
 * around the emblem and can't be reproduced with a web font.
 * variant "compact" — icon + wordmark only (text + separate icon image), for persistent app
 * chrome (the anthracite sidebar) where the full lockup image would be too wide/detailed at
 * small sizes — wordmark text renders gold, emblem renders as a white line-art silhouette,
 * both matching the brand's dark-background treatment.
 */
export function HipokratLogo({ size = 'md', variant = 'full', className }) {
  const s = SIZES[size] ?? SIZES.md

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center font-heading font-extrabold tracking-tight text-brand-gold', s.text, className)}>
        <span>HİP</span>
        <img
          src={emblemWhite}
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

  return (
    <img
      src={fullLogo}
      alt="HİPOKRAT Eğitim & Danışmanlık ve Kütüphane"
      className={cn('h-auto', FULL_WIDTHS[size] ?? FULL_WIDTHS.md, className)}
    />
  )
}
