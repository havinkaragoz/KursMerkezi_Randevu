import { WeeklyProgramViewer } from '@/components/WeeklyProgramViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GuidanceProgramPage() {
  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Haftalık ders programı</CardTitle>
      </CardHeader>
      <CardContent>
        <WeeklyProgramViewer />
      </CardContent>
    </Card>
  )
}
