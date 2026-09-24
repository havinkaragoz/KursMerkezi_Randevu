import { useQuery } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import { api } from '@/lib/api'

async function fetchAnnouncement() {
  const { data } = await api.get('/announcements/current')
  return data
}

export function AnnouncementBanner() {
  const { data: announcement } = useQuery({
    queryKey: ['announcement-current'],
    queryFn: fetchAnnouncement,
  })

  if (!announcement) return null

  return (
    <div className="flex items-start gap-3 overflow-hidden rounded-xl border border-brand-gold/40 bg-gradient-to-br from-brand-gold/20 via-brand-gold/5 to-background p-4 text-left shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-gold-foreground shadow-sm">
        <Megaphone size={19} strokeWidth={2.25} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-[11px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
          Duyuru
        </p>
        <p className="text-base font-bold text-foreground">{announcement.title}</p>
        <p className="text-sm text-muted-foreground">{announcement.message}</p>
      </div>
    </div>
  )
}
