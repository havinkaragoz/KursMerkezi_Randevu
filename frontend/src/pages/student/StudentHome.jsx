import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchMyAppointments() {
  const { data } = await api.get('/guidance/appointments/mine')
  return data
}

export function StudentHome() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['guidance-my-appointments'],
    queryFn: fetchMyAppointments,
    refetchInterval: 5000,
  })

  const activeAppointments = appointments?.filter((a) => a.status === 'BOOKED') ?? []

  return (
    <div className="flex flex-col gap-4">
      <AnnouncementBanner />

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Randevularım</CardTitle>
          <CardDescription>Aldığın rehberlik randevuları</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
          {!isLoading && activeAppointments.length === 0 && (
            <p className="text-muted-foreground">Aktif randevun yok.</p>
          )}
          {activeAppointments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border p-2.5"
            >
              <span className="text-sm font-medium">{a.guidanceTeacherFullName}</span>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(a.startTime)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
