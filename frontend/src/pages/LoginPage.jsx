import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const ROLE_HOME = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  GUIDANCE: '/guidance',
  ADMIN: '/admin',
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      navigate(ROLE_HOME[user.role] ?? '/')
    } catch {
      setError('Kullanıcı adı veya şifre hatalı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Kurs Merkezi Randevu</CardTitle>
          <CardDescription>Giriş yapmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Kullanıcı adı</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
