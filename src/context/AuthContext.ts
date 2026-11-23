import { createContext, useContext } from 'react'

export type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<'signed-in' | 'invalid' | 'not-admin' | 'unconfigured' | 'error'>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
