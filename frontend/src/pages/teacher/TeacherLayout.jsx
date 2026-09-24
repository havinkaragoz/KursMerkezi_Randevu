import { FileText, ListOrdered } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'

const NAV_ITEMS = [
  { to: '/teacher', label: 'Oturumlarım', icon: ListOrdered, end: true },
  { to: '/teacher/program', label: 'Haftalık Program', icon: FileText },
]

export function TeacherLayout() {
  return (
    <DashboardLayout title="Öğretmen Paneli" navItems={NAV_ITEMS}>
      <div className="mx-auto max-w-2xl">
        <Outlet />
      </div>
    </DashboardLayout>
  )
}
