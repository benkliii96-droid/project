import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  hasSubscription: boolean
  setHasSubscription: (val: boolean) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        checkSubscription(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        checkSubscription(session.user.id)
      } else {
        setHasSubscription(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkSubscription = async (userId: string) => {
    const mockSub = localStorage.getItem('fitcoach_mock_subscription')
    if (mockSub === 'true') {
      setHasSubscription(true)
      return
    }
    const { data } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()
    setHasSubscription(data?.status === 'active' || data?.status === 'trial')
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
      })
    }
    return { error: error as Error | null }
  }

  const signOut = async () => {
    localStorage.removeItem('fitcoach_mock_subscription')
    await supabase.auth.signOut()
    setHasSubscription(false)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, hasSubscription, setHasSubscription }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
