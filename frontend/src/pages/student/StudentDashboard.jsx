import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/DashboardLayout'
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
import { GuidanceBooking } from '@/pages/student/GuidanceBooking'

async function fetchSessions() {
  const { data } = await api.get('/queue/sessions')
  return data
}

export function StudentDashboard() {
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
    <DashboardLayout title="Öğrenci Paneli">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h2 className="text-left text-base font-medium">Açık soru çözüm oturumları</h2>

        {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}

        {!isLoading && sessions?.length === 0 && (
          <p className="text-muted-foreground">Şu anda açık bir oturum yok.</p>
        )}

        {sessions?.map((session) => {
          const myEntry = session.waitingList.find((e) => e.studentId === user.id)
          const isFull =
            session.maxCapacity != null && session.waitingList.length >= session.maxCapacity

          return (
            <Card key={session.id} className="text-left">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{session.title}</CardTitle>
                  <Badge variant="secondary">
                    {session.waitingList.length}
                    {session.maxCapacity != null ? ` / ${session.maxCapacity}` : ''} kişi
                  </Badge>
                </div>
                <CardDescription>{session.teacherFullName}</CardDescription>
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

        <GuidanceBooking />
      </div>
    </DashboardLayout>
  )
}
