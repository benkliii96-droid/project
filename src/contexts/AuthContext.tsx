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
    try {
      const mockSub = localStorage.getItem('fitcoach_mock_subscription')
      if (mockSub === 'true') {
        setHasSubscription(true)
      } else {
        const { data: rows } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
        const status = rows?.[0]?.status
        setHasSubscription(status === 'active' || status === 'trial')
      }
    } catch (e) {
      console.error('[checkSubscription]', e)
    }

    // Always restore quiz data from DB on login — localStorage may contain
    // data from a different user if they logged in on the same device
    try {
      await restoreQuizData(userId)
    } catch (e) {
      console.error('[restoreQuizData]', e)
    }
  }

  const restoreQuizData = async (userId: string) => {
    const { data: rows, error } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) { console.error('[restoreQuizData]', error.message); return }
    const data = rows?.[0]
    if (!data) return

    // Map DB column names back to the camelCase shape the app uses
    const quizData = {
      age: data.age,
      gender: data.gender,
      heightCm: data.height_cm,
      weightKg: data.weight_kg,
      trainingGoal: data.training_goal,
      bodyGoal: data.body_goal,
      fitnessLevel: data.fitness_level,
      trainingFrequency: data.training_frequency,
      trainingFormat: data.training_format,
      medicalConditions: data.medical_conditions ?? [],
      medicalNotes: data.medical_notes ?? '',
      photoUrl: data.photo_url ?? null,
      // New fields — may be null for old users, will use defaults in AI prompts
      primaryMotivation: data.primary_motivation ?? '',
      previousObstacle: data.previous_obstacle ?? '',
      sessionDuration: data.session_duration ?? '30_45',
      sleepHours: data.sleep_hours ?? '7_8',
      dietType: data.diet_type ?? 'no_restrictions',
      stressLevel: data.stress_level ?? '',
    }
    localStorage.setItem('quiz_data', JSON.stringify(quizData))
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
    // Clear all user-specific localStorage data on sign out so the next
    // user (or the same user on re-login) doesn't see stale/foreign data
    localStorage.removeItem('fitcoach_mock_subscription')
    localStorage.removeItem('fitcoach_offer_expiry')
    localStorage.removeItem('quiz_data')
    localStorage.removeItem('fitcoach_workout_plan')
    // Clear all cached meal plans (keys: fitcoach_meal_YYYY-MM-DD)
    Object.keys(localStorage)
      .filter(k => k.startsWith('fitcoach_meal_'))
      .forEach(k => localStorage.removeItem(k))
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
