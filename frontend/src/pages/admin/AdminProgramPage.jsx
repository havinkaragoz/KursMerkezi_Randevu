import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

const MAX_PROGRAMS = 3

async function fetchPrograms() {
  const { data } = await api.get('/programs')
  return data
}

export function AdminProgramPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')

  const { data: programs } = useQuery({
    queryKey: ['weekly-programs', refreshKey],
    queryFn: fetchPrograms,
  })

  const count = programs?.length ?? 0
  const atLimit = count >= MAX_PROGRAMS

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

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/programs/${id}`),
    onSuccess: () => {
      setError('')
      setRefreshKey((v) => v + 1)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (atLimit) {
      setError(`En fazla ${MAX_PROGRAMS} program yükleyebilirsin. Yeni birini eklemek için önce birini sil.`)
      return
    }
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
          Aynı anda en fazla {MAX_PROGRAMS} program yükleyebilirsin ({count}/{MAX_PROGRAMS}) —
          öğrenci, öğretmen ve rehberler yüklenen tüm programları görür.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            disabled={atLimit}
            className="text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-2.5 file:py-1.5 file:text-sm file:font-medium disabled:opacity-50"
          />
          <Button type="submit" size="sm" disabled={uploadMutation.isPending || atLimit}>
            Yükle
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <WeeklyProgramViewer
          refreshKey={refreshKey}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        />
      </CardContent>
    </Card>
  )
}
