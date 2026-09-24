import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
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

const STATUS_LABELS = {
  CANCELLED: 'İptal edildi',
  ATTENDED: 'Geldi',
  NO_SHOW: 'Gelmedi',
}

const STATUS_VARIANTS = {
  CANCELLED: 'secondary',
  ATTENDED: 'default',
  NO_SHOW: 'destructive',
}

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

export function GuidanceHistoryPage() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['guidance-teacher-appointments'],
    queryFn: fetchTeacherAppointments,
    refetchInterval: 10000,
  })

  const past = appointments?.filter((a) => a.status !== 'BOOKED') ?? []

  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Geçmiş</CardTitle>
        <CardDescription>Sonuçlanmış tüm rehberlik randevuları.</CardDescription>
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
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {past.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Henüz sonuçlanmış randevu yok.
                  </TableCell>
                </TableRow>
              )}
              {past.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.studentFullName}</TableCell>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell>{timeLabel(a.startTime)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[a.status] ?? 'secondary'}>
                      {STATUS_LABELS[a.status] ?? a.status}
                    </Badge>
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
