import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-muted">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.fullName} · {user?.role}
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          Çıkış yap
        </Button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
