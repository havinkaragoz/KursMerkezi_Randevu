import { DashboardLayout } from '@/components/DashboardLayout'

export function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Paneli">
      <p className="text-muted-foreground">
        Kullanıcı yönetimi, haftalık program yükleme ve aktivite geçmişi burada olacak.
      </p>
    </DashboardLayout>
  )
}
