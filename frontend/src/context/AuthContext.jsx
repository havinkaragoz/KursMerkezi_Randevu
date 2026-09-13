import { createContext, useContext, useState } from 'react'
import { api } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password })
    const loggedInUser = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
