import { WeeklyProgramViewer } from '@/components/WeeklyProgramViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TeacherProgramPage() {
  return (
    <Card className="text-left shadow-sm">
      <CardHeader>
        <CardTitle>Haftalık program</CardTitle>
      </CardHeader>
      <CardContent>
        <WeeklyProgramViewer />
      </CardContent>
    </Card>
  )
}
