import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

async function fetchSessions() {
  const { data } = await api.get('/queue/sessions')
  return data
}

export function TeacherDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
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
    })
  }

  const mySessions = sessions?.filter((s) => s.teacherId === user.id) ?? []

  return (
    <DashboardLayout title="Öğretmen Paneli">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Card className="text-left">
          <CardHeader>
            <CardTitle>Yeni oturum aç</CardTitle>
            <CardDescription>Kontenjanı boş bırakırsan sınırsız olur.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOpenSubmit} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-1 min-w-40 flex-col gap-2">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 10. Sınıf Matematik"
                />
              </div>
              <div className="flex w-32 flex-col gap-2">
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

          {mySessions.map((session) => (
            <Card key={session.id} className="text-left">
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
                <CardDescription>
                  {session.waitingList.length}
                  {session.maxCapacity != null ? ` / ${session.maxCapacity}` : ''} kişi kuyrukta
                </CardDescription>
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
