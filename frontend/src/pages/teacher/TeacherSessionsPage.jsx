import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'

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

export function TeacherSessionsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [formError, setFormError] = useState('')

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['queue-sessions'],
    queryFn: fetchSessions,
    refetchInterval: 4000,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['queue-sessions'] })

  const openMutation = useMutation({
    mutationFn: (payload) => api.post('/queue/sessions', payload),
    onSuccess: () => {
      setTitle('')
      setMaxCapacity('')
      setSessionTime('')
      invalidate()
    },
  })

  const closeMutation = useMutation({
    mutationFn: (id) => api.put(`/queue/sessions/${id}/close`),
    onSuccess: invalidate,
  })

  const nextMutation = useMutation({
    mutationFn: (id) => api.post(`/queue/sessions/${id}/next`),
    onSuccess: invalidate,
  })

  function handleOpenSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!title.trim()) {
      setFormError('Başlık gerekli.')
      return
    }
    openMutation.mutate({
      title: title.trim(),
      maxCapacity: maxCapacity ? Number(maxCapacity) : null,
      sessionTime: sessionTime ? `${sessionTime}:00` : null,
    })
  }

  const mySessions = sessions?.filter((s) => s.teacherId === user.id) ?? []

  return (
    <div className="flex flex-col gap-6">
      <AnnouncementBanner />

      <Card className="text-left shadow-sm">
        <CardHeader>
          <CardTitle>Yeni oturum aç</CardTitle>
          <CardDescription>Kontenjanı boş bırakırsan sınırsız olur.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOpenSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-40 flex-1 flex-col gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 10. Sınıf Matematik"
              />
            </div>
            <div className="flex w-44 flex-col gap-2">
              <Label htmlFor="sessionTime">Saat</Label>
              <Input
                id="sessionTime"
                type="datetime-local"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
              />
            </div>
            <div className="flex w-28 flex-col gap-2">
              <Label htmlFor="capacity">Kontenjan</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="Sınırsız"
              />
            </div>
            <Button type="submit" disabled={openMutation.isPending}>
              Oturumu aç
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-left text-base font-medium">Oturumlarım</h2>

        {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
        {!isLoading && mySessions.length === 0 && (
          <p className="text-muted-foreground">Açık oturumun yok.</p>
        )}

        {mySessions.map((session) => {
          const time = formatDateTime(session.sessionTime)
          return (
            <Card key={session.id} className="text-left shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{session.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={closeMutation.isPending}
                    onClick={() => closeMutation.mutate(session.id)}
                  >
                    Oturumu kapat
                  </Button>
                </div>
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
              <CardContent className="flex flex-col gap-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Öğrenci</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.waitingList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          Kuyrukta kimse yok.
                        </TableCell>
                      </TableRow>
                    )}
                    {session.waitingList.map((entry) => (
                      <TableRow key={entry.entryId}>
                        <TableCell>{entry.position}</TableCell>
                        <TableCell>{entry.studentFullName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  className="self-start"
                  size="sm"
                  disabled={session.waitingList.length === 0 || nextMutation.isPending}
                  onClick={() => nextMutation.mutate(session.id)}
                >
                  Sıradakini tamamla
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
