import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

async function fetchMeta() {
  try {
    const { data } = await api.get('/programs/current')
    return data
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
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

export function WeeklyProgramViewer({ refreshKey }) {
  const { data: meta, isLoading } = useQuery({
    queryKey: ['weekly-program-meta', refreshKey],
    queryFn: fetchMeta,
  })
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => {
    let objectUrl
    let cancelled = false

    if (meta) {
      api.get('/programs/current/file', { responseType: 'blob' }).then((res) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(res.data)
        setFileUrl(objectUrl)
      })
    } else {
      setFileUrl(null)
    }

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [meta?.id])

  if (isLoading) return <p className="text-muted-foreground">Yükleniyor...</p>
  if (!meta) return <p className="text-muted-foreground">Henüz bir program yüklenmemiş.</p>

  const isImage = meta.contentType?.startsWith('image/')

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {meta.uploadedByFullName} tarafından {formatDate(meta.uploadedAt)} yüklendi
      </p>
      {fileUrl && isImage && (
        <img src={fileUrl} alt="Haftalık program" className="w-full rounded-lg border" />
      )}
      {fileUrl && !isImage && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline"
        >
          {meta.originalFileName} dosyasını aç (PDF)
        </a>
      )}
    </div>
  )
}
