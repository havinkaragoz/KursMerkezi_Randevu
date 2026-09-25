import { CalendarClock, ClipboardList, FileText, History } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'

const NAV_ITEMS = [
  { to: '/guidance', label: 'Müsaitlik', icon: CalendarClock, end: true },
  { to: '/guidance/appointments', label: 'Randevularım', icon: ClipboardList },
  { to: '/guidance/program', label: 'Ders Programı', icon: FileText },
  { to: '/guidance/history', label: 'Geçmiş', icon: History },
]

export function GuidanceLayout() {
  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="mx-auto max-w-5xl">
        <Outlet />
      </div>
    </DashboardLayout>
  )
}
