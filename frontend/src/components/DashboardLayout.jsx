import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { HipokratLogo } from '@/components/HipokratLogo'

export function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-muted">
      <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
        <div className="flex items-center gap-4">
          <HipokratLogo size="sm" />
          <div className="hidden border-l pl-4 sm:block">
            <h1 className="text-base font-semibold">{title}</h1>
            <p className="text-xs text-muted-foreground">
              {user?.fullName} · {user?.role}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Çıkış yap
        </Button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
