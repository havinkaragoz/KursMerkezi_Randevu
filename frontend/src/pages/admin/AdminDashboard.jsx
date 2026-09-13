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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const ROLE_LABELS = {
  STUDENT: 'Öğrenci',
  TEACHER: 'Öğretmen',
  GUIDANCE: 'Rehber Öğretmen',
  ADMIN: 'Admin',
}

async function fetchUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

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

const emptyForm = { username: '', password: '', fullName: '', role: 'STUDENT' }

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  })

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setForm(emptyForm)
      setOpen(false)
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Kullanıcı oluşturulamadı.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password.trim() || !form.fullName.trim()) {
      setError('Tüm alanları doldurun.')
      return
    }
    createMutation.mutate(form)
  }

  return (
    <DashboardLayout title="Admin Paneli">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card className="text-left">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kullanıcılar</CardTitle>
                <CardDescription>Sistemdeki tüm kullanıcılar ve kayıt tarihleri</CardDescription>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button size="sm">Yeni kullanıcı ekle</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni kullanıcı ekle</DialogTitle>
                    <DialogDescription>
                      Kullanıcı bu bilgilerle giriş yapabilecek.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="fullName">Ad Soyad</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="username">Kullanıcı adı</Label>
                      <Input
                        id="username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select
                        value={form.role}
                        onValueChange={(value) => setForm({ ...form, role: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue>{(value) => ROLE_LABELS[value] ?? value}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending}>
                        Ekle
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
            {!isLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Kullanıcı adı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Kayıt tarihi</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.fullName}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(u.id)}
                        >
                          Sil
                        </Button>
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
