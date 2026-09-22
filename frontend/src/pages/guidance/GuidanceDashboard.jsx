import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'

const DAYS = [
  { value: 'MONDAY', label: 'Pazartesi' },
  { value: 'TUESDAY', label: 'Salı' },
  { value: 'WEDNESDAY', label: 'Çarşamba' },
  { value: 'THURSDAY', label: 'Perşembe' },
  { value: 'FRIDAY', label: 'Cuma' },
  { value: 'SATURDAY', label: 'Cumartesi' },
  { value: 'SUNDAY', label: 'Pazar' },
]
const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.value, d.label]))

function timeLabel(value) {
  if (!value) return ''
  return value.slice(0, 5)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchMyAvailability() {
  const { data } = await api.get('/guidance/availability/mine')
  return data
}

async function fetchTeacherAppointments() {
  const { data } = await api.get('/guidance/appointments/teacher')
  return data
}

export function GuidanceDashboard() {
  const queryClient = useQueryClient()
  const [day, setDay] = useState('MONDAY')
  const [startTime, setStartTime] = useState('')
  const [error, setError] = useState('')

  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['guidance-my-availability'],
    queryFn: fetchMyAvailability,
  })

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['guidance-teacher-appointments'],
    queryFn: fetchTeacherAppointments,
    refetchInterval: 10000,
  })

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/guidance/availability', payload),
    onSuccess: () => {
      setStartTime('')
      setError('')
      queryClient.invalidateQueries({ queryKey: ['guidance-my-availability'] })
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Müsaitlik eklenemedi.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/guidance/availability/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guidance-my-availability'] }),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!startTime) {
      setError('Bir saat seç.')
      return
    }
    createMutation.mutate({ dayOfWeek: day, startTime: `${startTime}:00` })
  }

  const groupedByDay = DAYS.map((d) => ({
    ...d,
    windows: availability?.filter((a) => a.dayOfWeek === d.value) ?? [],
  }))

  return (
    <DashboardLayout title="Rehber Öğretmen Paneli">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <AnnouncementBanner />

        <Card className="text-left shadow-sm">
          <CardHeader>
            <CardTitle>Haftalık müsaitlik ekle</CardTitle>
            <CardDescription>
              Her öğrenci yarım saat görüşür. Eklediğin saat her hafta aynı gün otomatik olarak
              açık olur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <div className="flex w-40 flex-col gap-2">
                <Label htmlFor="day">Gün</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger id="day" className="w-full">
                    <SelectValue>{(value) => DAY_LABELS[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-36 flex-col gap-2">
                <Label htmlFor="startTime">Başlangıç saati</Label>
                <Input
                  id="startTime"
                  type="time"
                  step={1800}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                Ekle
              </Button>
            </form>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <Card className="text-left shadow-sm">
          <CardHeader>
            <CardTitle>Haftalık programım</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {availabilityLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
            {!availabilityLoading &&
              groupedByDay.map((d) => (
                <div key={d.value} className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">{d.label}</p>
                  {d.windows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Müsaitlik eklenmemiş.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {d.windows.map((w) => (
                        <Badge key={w.id} variant="secondary" className="gap-1.5 py-1.5 pr-1.5">
                          {timeLabel(w.startTime)} - {timeLabel(w.endTime)}
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(w.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-full p-0.5 hover:bg-foreground/10"
                            aria-label="Sil"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="text-left shadow-sm">
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
                    <TableHead>Tarih</TableHead>
                    <TableHead>Saat</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Henüz randevu yok.
                      </TableCell>
                    </TableRow>
                  )}
                  {appointments?.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.studentFullName}</TableCell>
                      <TableCell>{formatDate(a.date)}</TableCell>
                      <TableCell>{timeLabel(a.startTime)}</TableCell>
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
