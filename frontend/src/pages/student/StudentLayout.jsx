import { CalendarClock, FileText, Home, ListOrdered } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'

const NAV_ITEMS = [
  { to: '/student', label: 'Ana Sayfa', icon: Home, end: true },
  { to: '/student/queue', label: 'Soru Çözüm Oturumları', icon: ListOrdered },
  { to: '/student/guidance', label: 'Rehberlik Randevusu', icon: CalendarClock },
  { to: '/student/program', label: 'Haftalık Program', icon: FileText },
]

export function StudentLayout() {
  return (
    <DashboardLayout title="Öğrenci Paneli" navItems={NAV_ITEMS}>
      <div className="mx-auto max-w-2xl">
        <Outlet />
      </div>
    </DashboardLayout>
  )
}
