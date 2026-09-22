import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DAY_LABELS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function timeLabel(value) {
  if (!value) return ''
  return value.slice(0, 5)
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(`${value}T00:00:00`)
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', weekday: 'long' })
}

async function fetchTeachers() {
  const { data } = await api.get('/guidance/teachers')
  return data
}

async function fetchDayAvailability(teacherId, date) {
  const { data } = await api.get('/guidance/availability/day', {
    params: { guidanceTeacherId: teacherId, date },
  })
  return data
}

async function fetchMyAppointments() {
  const { data } = await api.get('/guidance/appointments/mine')
  return data
}

export function GuidanceBooking() {
  const queryClient = useQueryClient()
  const [teacherId, setTeacherId] = useState('')
  const [date, setDate] = useState(todayIso())
  const [error, setError] = useState('')

  const { data: teachers } = useQuery({
    queryKey: ['guidance-teachers'],
    queryFn: fetchTeachers,
  })

  useEffect(() => {
    if (!teacherId && teachers?.length > 0) {
      setTeacherId(String(teachers[0].id))
    }
  }, [teachers, teacherId])

  const { data: dayWindows, isLoading: dayLoading } = useQuery({
    queryKey: ['guidance-day-availability', teacherId, date],
    queryFn: () => fetchDayAvailability(teacherId, date),
    enabled: !!teacherId && !!date,
    refetchInterval: 5000,
  })

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['guidance-my-appointments'],
    queryFn: fetchMyAppointments,
    refetchInterval: 5000,
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['guidance-day-availability'] })
    queryClient.invalidateQueries({ queryKey: ['guidance-my-appointments'] })
  }

  const bookMutation = useMutation({
    mutationFn: (availabilityId) => api.post('/guidance/appointments', { availabilityId, date }),
    onSuccess: () => {
      setError('')
      invalidateAll()
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Randevu alınamadı.')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (appointmentId) => api.delete(`/guidance/appointments/${appointmentId}`),
    onSuccess: invalidateAll,
  })

  const activeAppointments = appointments?.filter((a) => a.status === 'BOOKED') ?? []
  const selectedDayLabel = date ? DAY_LABELS_TR[new Date(`${date}T00:00:00`).getDay()] : ''

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-left text-base font-medium">Rehberlik randevusu</h2>

      <Card className="text-left shadow-sm">
        <CardHeader>
          <CardTitle>Randevu al</CardTitle>
          <CardDescription>
            Bir rehber öğretmen ve gün seç, boş (yeşil) bir saate tıkla. Her randevu yarım saat
            sürer.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-48 flex-1 flex-col gap-2">
              <Label>Rehber öğretmen</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Rehber öğretmen seç">
                    {(value) => teachers?.find((t) => String(t.id) === value)?.fullName ?? value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-44 flex-col gap-2">
              <Label htmlFor="bookingDate">Gün</Label>
              <Input
                id="bookingDate"
                type="date"
                min={todayIso()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {teachers?.length === 0 && (
            <p className="text-muted-foreground">Henüz rehber öğretmen tanımlanmamış.</p>
          )}

          {teacherId && date && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{selectedDayLabel} günü müsait saatler</p>
              {dayLoading && <p className="text-sm text-muted-foreground">Yükleniyor...</p>}
              {!dayLoading && dayWindows?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Bu öğretmenin {selectedDayLabel} günü müsaitliği yok.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {dayWindows?.map((w) => (
                  <button
                    key={w.availabilityId}
                    type="button"
                    disabled={w.booked || bookMutation.isPending}
                    onClick={() => bookMutation.mutate(w.availabilityId)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      w.booked
                        ? 'cursor-not-allowed border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'cursor-pointer border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400',
                    )}
                  >
                    {timeLabel(w.startTime)} {w.booked ? '· Dolu' : '· Boş'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="text-left shadow-sm">
        <CardHeader>
          <CardTitle>Randevularım</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {appointmentsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
          {!appointmentsLoading && activeAppointments.length === 0 && (
            <p className="text-muted-foreground">Aktif randevun yok.</p>
          )}
          {activeAppointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{a.guidanceTeacherFullName}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(a.date)}, {timeLabel(a.startTime)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(a.id)}
              >
                İptal et
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
