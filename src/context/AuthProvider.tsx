import { useMemo, useState, type ReactNode } from 'react'
import { endAdminSession, hasAdminSession, startAdminSession } from '../pages/admin/adminSession'
import { AuthContext, type AuthContextValue } from './AuthContext'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAdminSession)
  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    signIn(username, password) {
      if (!startAdminSession(username, password)) return false
      setIsAuthenticated(true)
      return true
    },
    signOut() {
      endAdminSession()
      setIsAuthenticated(false)
    },
  }), [isAuthenticated])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
