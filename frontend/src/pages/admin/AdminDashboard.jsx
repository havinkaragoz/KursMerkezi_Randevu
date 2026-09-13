import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { WeeklyProgramViewer } from '@/components/WeeklyProgramViewer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
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

async function fetchActivityLogs() {
  const { data } = await api.get('/admin/activity-logs', { params: { size: 100 } })
  return data.content
}

async function fetchAnnouncement() {
  const { data } = await api.get('/announcements/current')
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

  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: fetchActivityLogs,
    refetchInterval: 10000,
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

  const fileInputRef = useRef(null)
  const [programVersion, setProgramVersion] = useState(0)
  const [programError, setProgramError] = useState('')

  const uploadProgramMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post('/programs/upload', formData)
    },
    onSuccess: () => {
      setProgramError('')
      setProgramVersion((v) => v + 1)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    onError: (err) => {
      setProgramError(err.response?.data?.message ?? 'Dosya yüklenemedi.')
    },
  })

  function handleProgramUpload(e) {
    e.preventDefault()
    setProgramError('')
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setProgramError('Bir dosya seç.')
      return
    }
    uploadProgramMutation.mutate(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password.trim() || !form.fullName.trim()) {
      setError('Tüm alanları doldurun.')
      return
    }
    createMutation.mutate(form)
  }

  const { data: announcement } = useQuery({
    queryKey: ['announcement-current'],
    queryFn: fetchAnnouncement,
  })

  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' })
  const [announcementError, setAnnouncementError] = useState('')

  useEffect(() => {
    if (announcement) {
      setAnnouncementForm({ title: announcement.title, message: announcement.message })
    }
  }, [announcement])

  const announcementMutation = useMutation({
    mutationFn: (payload) => api.put('/announcements/current', payload),
    onSuccess: () => {
      setAnnouncementError('')
      queryClient.invalidateQueries({ queryKey: ['announcement-current'] })
    },
    onError: (err) => {
      setAnnouncementError(err.response?.data?.message ?? 'Duyuru kaydedilemedi.')
    },
  })

  function handleAnnouncementSubmit(e) {
    e.preventDefault()
    setAnnouncementError('')
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      setAnnouncementError('Başlık ve mesaj gerekli.')
      return
    }
    announcementMutation.mutate(announcementForm)
  }

  return (
    <DashboardLayout title="Admin Paneli">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card className="text-left">
          <CardHeader>
            <CardTitle>Duyuru</CardTitle>
            <CardDescription>
              Öğrenci, öğretmen ve rehber panellerinin üstünde gösterilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {announcement && <AnnouncementBanner />}
            <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="announcementTitle">Başlık</Label>
                <Input
                  id="announcementTitle"
                  value={announcementForm.title}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, title: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="announcementMessage">Mesaj</Label>
                <Textarea
                  id="announcementMessage"
                  rows={3}
                  value={announcementForm.message}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, message: e.target.value })
                  }
                />
              </div>
              {announcementError && (
                <p className="text-sm text-destructive">{announcementError}</p>
              )}
              <Button type="submit" size="sm" className="self-start" disabled={announcementMutation.isPending}>
                Duyuruyu yayınla
              </Button>
            </form>
          </CardContent>
        </Card>

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

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Haftalık program</CardTitle>
            <CardDescription>
              Yeni bir resim veya PDF yükleyince öğrenciler en son yüklenen programı görür.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleProgramUpload} className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-2.5 file:py-1.5 file:text-sm file:font-medium"
              />
              <Button type="submit" size="sm" disabled={uploadProgramMutation.isPending}>
                Yükle
              </Button>
            </form>
            {programError && <p className="text-sm text-destructive">{programError}</p>}
            <WeeklyProgramViewer refreshKey={programVersion} />
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Aktivite geçmişi</CardTitle>
            <CardDescription>Sistemdeki önemli işlemlerin kaydı</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading && <p className="text-muted-foreground">Yükleniyor...</p>}
            {!logsLoading && (
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
                        Henüz bir kayıt yok.
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
      </div>
    </DashboardLayout>
  )
}
