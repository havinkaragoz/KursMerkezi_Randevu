import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchTeachers() {
  const { data } = await api.get('/guidance/teachers')
  return data
}

async function fetchAvailableSlots(teacherId) {
  const { data } = await api.get(`/guidance/slots/available/${teacherId}`)
  return data
}

async function fetchMyAppointments() {
  const { data } = await api.get('/guidance/appointments/mine')
  return data
}

export function GuidanceBooking() {
  const queryClient = useQueryClient()
  const [teacherId, setTeacherId] = useState('')

  const { data: teachers } = useQuery({
    queryKey: ['guidance-teachers'],
    queryFn: fetchTeachers,
  })

  useEffect(() => {
    if (!teacherId && teachers?.length > 0) {
      setTeacherId(String(teachers[0].id))
    }
  }, [teachers, teacherId])

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['guidance-available-slots', teacherId],
    queryFn: () => fetchAvailableSlots(teacherId),
    enabled: !!teacherId,
    refetchInterval: 5000,
  })

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['guidance-my-appointments'],
    queryFn: fetchMyAppointments,
    refetchInterval: 5000,
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['guidance-available-slots'] })
    queryClient.invalidateQueries({ queryKey: ['guidance-my-appointments'] })
  }

  const bookMutation = useMutation({
    mutationFn: (slotId) => api.post(`/guidance/slots/${slotId}/book`),
    onSuccess: invalidateAll,
  })

  const cancelMutation = useMutation({
    mutationFn: (appointmentId) => api.delete(`/guidance/appointments/${appointmentId}`),
    onSuccess: invalidateAll,
  })

  const activeAppointments = appointments?.filter((a) => a.status === 'BOOKED') ?? []

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-left text-base font-medium">Rehberlik randevusu</h2>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Müsait saatler</CardTitle>
          <CardDescription>Bir rehber öğretmen seçip boş saate randevu al.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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

          {teachers?.length === 0 && (
            <p className="text-muted-foreground">Henüz rehber öğretmen tanımlanmamış.</p>
          )}

          {slotsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
          {!slotsLoading && slots?.length === 0 && (
            <p className="text-muted-foreground">Bu öğretmenin şu an boş saati yok.</p>
          )}
          {slots?.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between rounded-lg border p-2.5">
              <span className="text-sm">
                {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
              </span>
              <Button
                size="sm"
                disabled={bookMutation.isPending}
                onClick={() => bookMutation.mutate(slot.id)}
              >
                Randevu al
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="text-left">
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
                  {formatDateTime(a.startTime)}
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
