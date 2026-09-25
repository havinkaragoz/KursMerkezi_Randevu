import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { HipokratLogo } from '@/components/HipokratLogo'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/roleLabels'

export function DashboardLayout({ navItems, children }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh bg-muted">
      <aside className="flex w-60 shrink-0 flex-col justify-between bg-brand-anthracite px-4 py-5">
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
                        : 'text-brand-anthracite-foreground/65 hover:bg-white/10 hover:text-brand-anthracite-foreground',
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

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <div className="px-1">
            <p className="truncate text-sm font-medium text-brand-anthracite-foreground">
              {user?.fullName}
            </p>
            <p className="text-xs text-brand-anthracite-foreground/60">
              {ROLE_LABELS[user?.role] ?? user?.role}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-white/15 bg-transparent text-brand-anthracite-foreground hover:bg-white/10 hover:text-brand-anthracite-foreground"
          >
            Çıkış yap
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b bg-background px-8 py-5">
          <h1 className="text-xl font-semibold">Hoş geldiniz, {user?.fullName}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
