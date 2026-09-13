import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/DashboardLayout'
import { api } from '@/lib/api'
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

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchMySlots() {
  const { data } = await api.get('/guidance/slots/mine')
  return data
}

async function fetchTeacherAppointments() {
  const { data } = await api.get('/guidance/appointments/teacher')
  return data
}

export function GuidanceDashboard() {
  const queryClient = useQueryClient()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['guidance-my-slots'],
    queryFn: fetchMySlots,
    refetchInterval: 5000,
  })

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['guidance-teacher-appointments'],
    queryFn: fetchTeacherAppointments,
    refetchInterval: 5000,
  })

  const createSlotMutation = useMutation({
    mutationFn: (payload) => api.post('/guidance/slots', payload),
    onSuccess: () => {
      setStartTime('')
      setEndTime('')
      setError('')
      queryClient.invalidateQueries({ queryKey: ['guidance-my-slots'] })
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Saat oluşturulamadı.')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!startTime || !endTime) {
      setError('Başlangıç ve bitiş saati gerekli.')
      return
    }
    createSlotMutation.mutate({
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
    })
  }

  return (
    <DashboardLayout title="Rehber Öğretmen Paneli">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Card className="text-left">
          <CardHeader>
            <CardTitle>Müsaitlik saati ekle</CardTitle>
            <CardDescription>Öğrenciler bu saat aralığına randevu alabilecek.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startTime">Başlangıç</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endTime">Bitiş</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={createSlotMutation.isPending}>
                Ekle
              </Button>
            </form>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Saatlerim</CardTitle>
          </CardHeader>
          <CardContent>
            {slotsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
            {!slotsLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>Bitiş</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        Henüz saat eklemedin.
                      </TableCell>
                    </TableRow>
                  )}
                  {slots?.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{formatDateTime(slot.startTime)}</TableCell>
                      <TableCell>{formatDateTime(slot.endTime)}</TableCell>
                      <TableCell>
                        <Badge variant={slot.booked ? 'default' : 'secondary'}>
                          {slot.booked ? 'Dolu' : 'Boş'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Randevularım</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
            {!appointmentsLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Öğrenci</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        Henüz randevu yok.
                      </TableCell>
                    </TableRow>
                  )}
                  {appointments?.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.studentFullName}</TableCell>
                      <TableCell>{formatDateTime(a.startTime)}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === 'BOOKED' ? 'default' : 'secondary'}>
                          {a.status === 'BOOKED' ? 'Alındı' : 'İptal edildi'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
