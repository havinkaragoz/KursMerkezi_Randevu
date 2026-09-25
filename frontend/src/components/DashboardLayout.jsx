import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { HipokratLogo } from '@/components/HipokratLogo'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/roleLabels'

export function DashboardLayout({ navItems, children }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-muted">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-svh w-60 shrink-0 flex-col justify-between overflow-y-auto bg-brand-anthracite px-4 py-5 transition-transform duration-200 lg:sticky lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <HipokratLogo variant="compact" size="md" className="w-full justify-center py-1" />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="shrink-0 rounded-lg p-1.5 text-brand-anthracite-foreground/70 hover:bg-white/10 hover:text-brand-anthracite-foreground lg:hidden"
              aria-label="Menüyü kapat"
            >
              <X size={18} />
            </button>
          </div>

          {navItems && navItems.length > 0 && (
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
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
        <header className="flex items-center gap-3 border-b bg-background px-4 py-4 sm:px-8 sm:py-5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="shrink-0 rounded-lg p-1.5 text-foreground hover:bg-muted lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu size={22} />
          </button>
          <h1 className="truncate text-lg font-semibold sm:text-xl">
            Hoş geldiniz, {user?.fullName}
          </h1>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
