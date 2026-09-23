import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ROLE_LABELS } from '@/lib/roleLabels'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const FILTERS = [
  { value: null, label: 'Tümü' },
  { value: 'STUDENT', label: 'Öğrenci' },
  { value: 'TEACHER', label: 'Öğretmen' },
  { value: 'GUIDANCE', label: 'Rehber Öğretmen' },
  { value: 'ADMIN', label: 'Admin' },
]

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchActivityLogs(actorRole) {
  const { data } = await api.get('/admin/activity-logs', {
    params: { size: 100, ...(actorRole ? { actorRole } : {}) },
  })
  return data.content
}

export function AdminActivityLogPage() {
  const [filter, setFilter] = useState(null)

  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['admin-activity-logs', filter],
    queryFn: () => fetchActivityLogs(filter),
    refetchInterval: 10000,
  })

  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Aktivite geçmişi</CardTitle>
        <CardDescription>Role göre filtreleyerek işlemleri daha kolay takip et.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.label}
              type="button"
              size="sm"
              variant={filter === f.value ? 'default' : 'outline'}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
        {!isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Açıklama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Bu filtrede kayıt yok.
                  </TableCell>
                </TableRow>
              )}
              {activityLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>{log.actorFullName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ROLE_LABELS[log.actorRole] ?? log.actorRole}</Badge>
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
