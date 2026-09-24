import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function formatDateTime(date, startTime) {
  if (!date) return '-'
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return `${dateLabel}, ${startTime?.slice(0, 5) ?? ''}`
}

async function fetchMyAppointments() {
  const { data } = await api.get('/guidance/appointments/mine')
  return data
}

async function fetchSessions() {
  const { data } = await api.get('/queue/sessions')
  return data
}

export function StudentHome() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['guidance-my-appointments'],
    queryFn: fetchMyAppointments,
    refetchInterval: 5000,
  })

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['queue-sessions'],
    queryFn: fetchSessions,
    refetchInterval: 4000,
  })

  const leaveMutation = useMutation({
    mutationFn: (sessionId) => api.post(`/queue/sessions/${sessionId}/leave`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-sessions'] }),
  })

  const activeAppointments = appointments?.filter((a) => a.status === 'BOOKED') ?? []
  const myQueues = (sessions ?? [])
    .map((session) => {
      const entry = session.waitingList.find((e) => e.studentId === user.id)
      return entry ? { session, entry } : null
    })
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-4">
      <AnnouncementBanner />

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Kuyruklarım</CardTitle>
          <CardDescription>Şu an sırada beklediğin soru çözüm oturumları</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sessionsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
          {!sessionsLoading && myQueues.length === 0 && (
            <p className="text-muted-foreground">Şu an bir kuyrukta değilsin.</p>
          )}
          {myQueues.map(({ session, entry }) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border p-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session.title}</span>
                <span className="text-sm text-muted-foreground">
                  {session.teacherFullName} · {entry.position}. sıradasın
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={leaveMutation.isPending}
                onClick={() => leaveMutation.mutate(session.id)}
              >
                Kuyruktan çık
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Randevularım</CardTitle>
          <CardDescription>Aldığın rehberlik randevuları</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {appointmentsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
          {!appointmentsLoading && activeAppointments.length === 0 && (
            <p className="text-muted-foreground">Aktif randevun yok.</p>
          )}
          {activeAppointments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border p-2.5"
            >
              <span className="text-sm font-medium">{a.guidanceTeacherFullName}</span>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(a.date, a.startTime)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
