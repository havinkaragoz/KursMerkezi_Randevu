import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard'
import { GuidanceDashboard } from '@/pages/guidance/GuidanceDashboard'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'

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
        <Route path="/student" element={<StudentDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['GUIDANCE']} />}>
        <Route path="/guidance" element={<GuidanceDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
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
