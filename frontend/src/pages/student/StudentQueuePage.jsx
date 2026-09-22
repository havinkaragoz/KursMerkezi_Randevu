import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function formatDateTime(value) {
  if (!value) return null
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchSessions() {
  const { data } = await api.get('/queue/sessions')
  return data
}

export function StudentQueuePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['queue-sessions'],
    queryFn: fetchSessions,
    refetchInterval: 4000,
  })

  const joinMutation = useMutation({
    mutationFn: (sessionId) => api.post(`/queue/sessions/${sessionId}/join`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-sessions'] }),
  })

  const leaveMutation = useMutation({
    mutationFn: (sessionId) => api.post(`/queue/sessions/${sessionId}/leave`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-sessions'] }),
  })

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-left text-base font-medium">Açık soru çözüm oturumları</h2>

      {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}

      {!isLoading && sessions?.length === 0 && (
        <p className="text-muted-foreground">Şu anda açık bir oturum yok.</p>
      )}

      {sessions?.map((session) => {
        const myEntry = session.waitingList.find((e) => e.studentId === user.id)
        const isFull =
          session.maxCapacity != null && session.waitingList.length >= session.maxCapacity
        const time = formatDateTime(session.sessionTime)

        return (
          <Card key={session.id} className="text-left shadow-sm">
            <CardHeader>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>{session.teacherFullName}</CardDescription>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {time && (
                  <Badge variant="secondary" className="gap-1">
                    <CalendarClock size={13} /> {time}
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1">
                  <Users size={13} />
                  {session.waitingList.length}
                  {session.maxCapacity != null ? ` / ${session.maxCapacity}` : ''} kişi
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {myEntry ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Sıradasın: <span className="font-semibold">{myEntry.position}.</span> sırada
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={leaveMutation.isPending}
                    onClick={() => leaveMutation.mutate(session.id)}
                  >
                    Kuyruktan çık
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  disabled={isFull || joinMutation.isPending}
                  onClick={() => joinMutation.mutate(session.id)}
                >
                  {isFull ? 'Kontenjan dolu' : 'Kuyruğa katıl'}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
