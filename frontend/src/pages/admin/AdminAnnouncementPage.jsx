import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

async function fetchAnnouncement() {
  const { data } = await api.get('/announcements/current')
  return data
}

export function AdminAnnouncementPage() {
  const queryClient = useQueryClient()
  const { data: announcement } = useQuery({
    queryKey: ['announcement-current'],
    queryFn: fetchAnnouncement,
  })

  const [form, setForm] = useState({ title: '', message: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (announcement) {
      setForm({ title: announcement.title, message: announcement.message })
    }
  }, [announcement])

  const mutation = useMutation({
    mutationFn: (payload) => api.put('/announcements/current', payload),
    onSuccess: () => {
      setError('')
      queryClient.invalidateQueries({ queryKey: ['announcement-current'] })
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Duyuru kaydedilemedi.')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.message.trim()) {
      setError('Başlık ve mesaj gerekli.')
      return
    }
    mutation.mutate(form)
  }

  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Duyuru</CardTitle>
        <CardDescription>
          Öğrenci, öğretmen ve rehber panellerinin üstünde gösterilir.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {announcement && <AnnouncementBanner />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcementTitle">Başlık</Label>
            <Input
              id="announcementTitle"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcementMessage">Mesaj</Label>
            <Textarea
              id="announcementMessage"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="self-start" disabled={mutation.isPending}>
            Duyuruyu yayınla
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
