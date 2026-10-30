import { createContext, useContext } from 'react'

export type AuthContextValue = {
  isAuthenticated: boolean
  signIn: (username: string, password: string) => boolean
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
