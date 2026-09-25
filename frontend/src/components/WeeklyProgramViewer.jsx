import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

async function fetchPrograms() {
  const { data } = await api.get('/programs')
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

function ProgramItem({ program, onDelete, deleting }) {
  const [fileUrl, setFileUrl] = useState(null)
  const [zoomOpen, setZoomOpen] = useState(false)

  useEffect(() => {
    let objectUrl
    let cancelled = false

    api.get(`/programs/${program.id}/file`, { responseType: 'blob' }).then((res) => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(res.data)
      setFileUrl(objectUrl)
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [program.id])

  const isImage = program.contentType?.startsWith('image/')

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {program.uploadedByFullName} tarafından {formatDate(program.uploadedAt)} yüklendi
        </p>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={() => onDelete(program.id)}
          >
            Sil
          </Button>
        )}
      </div>
      {fileUrl && isImage && (
        <>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="self-start"
            title="Tam boyutta görmek için tıkla"
          >
            <img
              src={fileUrl}
              alt={program.originalFileName}
              className="max-w-full cursor-zoom-in rounded-lg border"
            />
          </button>
          <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
            <DialogContent className="w-auto max-w-[95vw] gap-0 overflow-auto p-2 sm:max-w-[95vw]">
              <DialogTitle className="sr-only">{program.originalFileName}</DialogTitle>
              <img src={fileUrl} alt={program.originalFileName} className="block max-h-[85vh] w-auto max-w-full" />
            </DialogContent>
          </Dialog>
        </>
      )}
      {fileUrl && !isImage && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline"
        >
          {program.originalFileName} dosyasını aç (PDF)
        </a>
      )}
    </div>
  )
}

export function WeeklyProgramViewer({ refreshKey, onDelete, deletingId }) {
  const { data: programs, isLoading } = useQuery({
    queryKey: ['weekly-programs', refreshKey],
    queryFn: fetchPrograms,
  })

  if (isLoading) return <p className="text-muted-foreground">Yükleniyor...</p>
  if (!programs || programs.length === 0) {
    return <p className="text-muted-foreground">Henüz bir program yüklenmemiş.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {programs.map((program) => (
        <ProgramItem
          key={program.id}
          program={program}
          onDelete={onDelete}
          deleting={deletingId === program.id}
        />
      ))}
    </div>
  )
}
