import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { api } from '@/lib/api'
import { ROLE_LABELS } from '@/lib/roleLabels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

async function fetchActivityLogs(actorRole, search) {
  const { data } = await api.get('/admin/activity-logs', {
    params: {
      size: 100,
      ...(actorRole ? { actorRole } : {}),
      ...(search ? { search } : {}),
    },
  })
  return data.content
}

export function AdminActivityLogPage() {
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['admin-activity-logs', filter, debouncedSearch],
    queryFn: () => fetchActivityLogs(filter, debouncedSearch),
    refetchInterval: 10000,
  })

  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Aktivite geçmişi</CardTitle>
        <CardDescription>
          Bir kullanıcı ara veya role göre filtrele — örn. bir öğrenci/veli geldiğinde onunla
          ilgili tüm işlemleri tek bakışta görmek için.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Kullanıcı adıyla ara (örn. Mehmet Ogrenci)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

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
