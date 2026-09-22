import { CalendarClock, FileText, Home, ListOrdered } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/student', label: 'Ana Sayfa', icon: Home, end: true },
  { to: '/student/queue', label: 'Soru Çözüm Oturumları', icon: ListOrdered },
  { to: '/student/guidance', label: 'Rehberlik Randevusu', icon: CalendarClock },
  { to: '/student/program', label: 'Haftalık Program', icon: FileText },
]

export function StudentLayout() {
  return (
    <DashboardLayout title="Öğrenci Paneli">
      <div className="mx-auto flex max-w-4xl gap-6">
        <nav className="flex w-56 shrink-0 flex-col gap-1 self-stretch rounded-xl border bg-background p-3 shadow-sm">
          <p className="px-3 pt-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Menü
          </p>
          {NAV_ITEMS.map((item) => (
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
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </DashboardLayout>
  )
}
