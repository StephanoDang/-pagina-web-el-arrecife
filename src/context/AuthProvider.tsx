import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../config/supabaseClient'
import { hasAdminRole } from './adminAccess'
import { AuthContext, type AuthContextValue } from './AuthContext'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    const client = supabase
    if (!client) {
      return
    }

    let active = true
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (active) {
        setIsAuthenticated(hasAdminRole(session?.user))
        setIsLoading(false)
      }
    })

    void client.auth.getSession().then(async ({ data, error }) => {
      if (!active) return
      if (error || !data.session) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const { data: userData, error: userError } = await client.auth.getUser(data.session.access_token)
      if (!active) return
      const isAdmin = !userError && hasAdminRole(userData.user)
      setIsAuthenticated(isAdmin)
      setIsLoading(false)
      if (!isAdmin) await client.auth.signOut()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    if (!supabase) return 'unconfigured'

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.status && [400, 401, 422].includes(error.status) ? 'invalid' : 'error'
    if (!data.user) return 'error'
    if (!hasAdminRole(data.user)) {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      return 'not-admin'
    }

    setIsAuthenticated(true)
    return 'signed-in'
  }, [])

  const signOut = useCallback(async () => {
    setIsAuthenticated(false)
    if (supabase) await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ isAuthenticated, isLoading, signIn, signOut }), [isAuthenticated, isLoading, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
