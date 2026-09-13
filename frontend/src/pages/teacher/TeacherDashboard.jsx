import { DashboardLayout } from '@/components/DashboardLayout'

export function TeacherDashboard() {
  return (
    <DashboardLayout title="Öğretmen Paneli">
      <p className="text-muted-foreground">
        Soru çözüm oturumu açma/kapatma ve kuyruk yönetimi burada olacak.
      </p>
    </DashboardLayout>
  )
}
