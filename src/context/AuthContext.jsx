import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { mockAuth } from '../lib/mockBackend'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [realUser, setRealUser] = useState(null)
  const [practiceUser, setPracticeUser] = useState(null)
  const [realLoaded, setRealLoaded] = useState(false)
  const [practiceLoaded, setPracticeLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) setRealUser(data.session?.user ?? null)
      })
      .catch((err) => {
        console.error('Failed to load Supabase session:', err)
      })
      .finally(() => {
        if (isMounted) setRealLoaded(true)
      })

    const { data: realSub } = supabase.auth.onAuthStateChange((_event, session) => {
      setRealUser(session?.user ?? null)
    })

    // The practice sign-in flow on /login (see Login.jsx) always uses the
    // local mock session, even when a real Supabase project is connected,
    // since it never collects a real password to authenticate with. We
    // track it here in parallel so completing that flow still grants
    // dashboard access — a real Supabase session (if one exists) wins.
    mockAuth
      .getSession()
      .then(({ data }) => {
        if (isMounted) setPracticeUser(data.session?.user ?? null)
      })
      .finally(() => {
        if (isMounted) setPracticeLoaded(true)
      })

    const { data: practiceSub } = mockAuth.onAuthStateChange((_event, session) => {
      setPracticeUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      realSub?.subscription?.unsubscribe()
      practiceSub?.subscription?.unsubscribe()
    }
  }, [])

  const user = realUser || practiceUser
  const loading = !realLoaded || !practiceLoaded

  const signOut = async () => {
    if (realUser) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    if (practiceUser) {
      await mockAuth.signOut()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
