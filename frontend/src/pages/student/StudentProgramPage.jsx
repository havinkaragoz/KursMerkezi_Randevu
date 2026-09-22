import { WeeklyProgramViewer } from '@/components/WeeklyProgramViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StudentProgramPage() {
  return (
    <Card className="text-left">
      <CardHeader>
        <CardTitle>Haftalık program</CardTitle>
      </CardHeader>
      <CardContent>
        <WeeklyProgramViewer />
      </CardContent>
    </Card>
  )
}
