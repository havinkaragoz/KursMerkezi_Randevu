import { useQuery } from '@tanstack/react-query'
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
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-left">
      <p className="text-sm font-semibold">{announcement.title}</p>
      <p className="text-sm text-muted-foreground">{announcement.message}</p>
    </div>
  )
}
