import { DashboardLayout } from '@/components/DashboardLayout'

export function StudentDashboard() {
  return (
    <DashboardLayout title="Öğrenci Paneli">
      <p className="text-muted-foreground">
        Soru çözüm kuyruğu, rehberlik randevusu ve haftalık program burada olacak.
      </p>
    </DashboardLayout>
  )
}
