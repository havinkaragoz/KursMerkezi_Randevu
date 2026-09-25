import { History, Megaphone, Users, FileText } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'

const NAV_ITEMS = [
  { to: '/admin', label: 'Duyuru', icon: Megaphone, end: true },
  { to: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { to: '/admin/program', label: 'Haftalık Program', icon: FileText },
  { to: '/admin/activity', label: 'Aktivite Geçmişi', icon: History },
]

export function AdminLayout() {
  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="mx-auto max-w-3xl">
        <Outlet />
      </div>
    </DashboardLayout>
  )
}
