import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
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

function timeLabel(value) {
  if (!value) return ''
  return value.slice(0, 5)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchTeacherAppointments() {
  const { data } = await api.get('/guidance/appointments/teacher')
  return data
}

export function GuidanceAppointmentsPage() {
  const queryClient = useQueryClient()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['guidance-teacher-appointments'],
    queryFn: fetchTeacherAppointments,
    refetchInterval: 10000,
  })

  const attendanceMutation = useMutation({
    mutationFn: ({ id, attended }) =>
      api.put(`/guidance/appointments/${id}/attendance`, null, { params: { attended } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guidance-teacher-appointments'] }),
  })

  const current = appointments?.filter((a) => a.status === 'BOOKED') ?? []

  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Randevularım</CardTitle>
        <CardDescription>
          Görüşme gerçekleşince öğrenciyi geldi ✓ veya gelmedi ✕ olarak işaretle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
        {!isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Öğrenci</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Saat</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Güncel randevun yok.
                  </TableCell>
                </TableRow>
              )}
              {current.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.studentFullName}</TableCell>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell>{timeLabel(a.startTime)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        title="Geldi"
                        disabled={attendanceMutation.isPending}
                        onClick={() => attendanceMutation.mutate({ id: a.id, attended: true })}
                        className={cn(
                          'inline-flex size-7 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400',
                        )}
                      >
                        <Check size={15} strokeWidth={2.75} />
                      </button>
                      <button
                        type="button"
                        title="Gelmedi"
                        disabled={attendanceMutation.isPending}
                        onClick={() => attendanceMutation.mutate({ id: a.id, attended: false })}
                        className={cn(
                          'inline-flex size-7 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400',
                        )}
                      >
                        <X size={15} strokeWidth={2.75} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
