import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { StudentLayout } from '@/pages/student/StudentLayout'
import { StudentHome } from '@/pages/student/StudentHome'
import { StudentQueuePage } from '@/pages/student/StudentQueuePage'
import { GuidanceBooking } from '@/pages/student/GuidanceBooking'
import { StudentProgramPage } from '@/pages/student/StudentProgramPage'
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard'
import { GuidanceLayout } from '@/pages/guidance/GuidanceLayout'
import { GuidanceAvailabilityPage } from '@/pages/guidance/GuidanceAvailabilityPage'
import { GuidanceAppointmentsPage } from '@/pages/guidance/GuidanceAppointmentsPage'
import { GuidanceProgramPage } from '@/pages/guidance/GuidanceProgramPage'
import { GuidanceHistoryPage } from '@/pages/guidance/GuidanceHistoryPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminAnnouncementPage } from '@/pages/admin/AdminAnnouncementPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminProgramPage } from '@/pages/admin/AdminProgramPage'
import { AdminActivityLogPage } from '@/pages/admin/AdminActivityLogPage'

const queryClient = new QueryClient()

const ROLE_HOME = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  GUIDANCE: '/guidance',
  ADMIN: '/admin',
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentHome />} />
          <Route path="queue" element={<StudentQueuePage />} />
          <Route path="guidance" element={<GuidanceBooking />} />
          <Route path="program" element={<StudentProgramPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['GUIDANCE']} />}>
        <Route path="/guidance" element={<GuidanceLayout />}>
          <Route index element={<GuidanceAvailabilityPage />} />
          <Route path="appointments" element={<GuidanceAppointmentsPage />} />
          <Route path="program" element={<GuidanceProgramPage />} />
          <Route path="history" element={<GuidanceHistoryPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminAnnouncementPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="program" element={<AdminProgramPage />} />
          <Route path="activity" element={<AdminActivityLogPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
