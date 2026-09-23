import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { WeeklyProgramViewer } from '@/components/WeeklyProgramViewer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function AdminProgramPage() {
  const fileInputRef = useRef(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post('/programs/upload', formData)
    },
    onSuccess: () => {
      setError('')
      setRefreshKey((v) => v + 1)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Dosya yüklenemedi.')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Bir dosya seç.')
      return
    }
    uploadMutation.mutate(file)
  }

  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Haftalık program</CardTitle>
        <CardDescription>
          Yeni bir resim veya PDF yükleyince öğrenciler en son yüklenen programı görür.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-2.5 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button type="submit" size="sm" disabled={uploadMutation.isPending}>
            Yükle
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <WeeklyProgramViewer refreshKey={refreshKey} />
      </CardContent>
    </Card>
  )
}
