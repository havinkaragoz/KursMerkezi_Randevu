import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { HipokratLogo } from '@/components/HipokratLogo'
import { cn } from '@/lib/utils'

const ROLE_LABELS = {
  STUDENT: 'Öğrenci',
  TEACHER: 'Öğretmen',
  GUIDANCE: 'Rehber Öğretmen',
  ADMIN: 'Admin',
}

export function DashboardLayout({ title, navItems, children }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh bg-muted">
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r bg-background px-4 py-5">
        <div className="flex flex-col gap-6">
          <HipokratLogo variant="compact" size="sm" className="px-1" />

          {navItems && navItems.length > 0 && (
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-gold text-brand-gold-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <item.icon size={17} strokeWidth={2.25} className="shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="px-1">
            <p className="truncate text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[user?.role] ?? user?.role}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Çıkış yap
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b bg-background px-8 py-5">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
