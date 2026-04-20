import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Dumbbell, Eye, EyeOff, ArrowRight, ClipboardList } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState<'register' | 'login'>('register')
  const hasQuizData = !!localStorage.getItem('quiz_data')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const saveQuizData = async (userId: string) => {
    try {
      const stored = localStorage.getItem('quiz_data')
      if (!stored) return
      const quizData = JSON.parse(stored)
      await supabase.from('quiz_responses').upsert({
        user_id: userId,
        age: quizData.age,
        gender: quizData.gender,
        height_cm: quizData.heightCm,
        weight_kg: quizData.weightKg,
        training_goal: quizData.trainingGoal,
        body_goal: quizData.bodyGoal,
        fitness_level: quizData.fitnessLevel,
        training_frequency: quizData.trainingFrequency,
        training_format: quizData.trainingFormat,
        medical_conditions: quizData.medicalConditions || [],
        medical_notes: quizData.medicalNotes || '',
      })
    } catch (e) {
      console.warn('Could not save quiz data', e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Block sign-up if quiz wasn't completed
    if (tab === 'register' && !hasQuizData) {
      navigate('/quiz')
      return
    }

    setLoading(true)
    try {
      if (tab === 'register') {
        const { error: err } = await signUp(email, password, fullName)
        if (err) { setError(err.message); return }
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await saveQuizData(user.id)
      } else {
        const { error: err } = await signIn(email, password)
        if (err) { setError(err.message); return }
      }
      navigate('/subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a15] flex items-center justify-center px-6 bg-mesh">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Dumbbell size={20} className="text-slate-900" />
            </div>
          </div>
          {tab === 'register' && hasQuizData ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Your plan is ready!</h1>
              <p className="text-slate-400">Create an account to unlock your personalized AI fitness program.</p>
            </>
          ) : tab === 'register' ? (
            <>
              <h1 className="text-3xl font-bold mb-2">First, take the quiz</h1>
              <p className="text-slate-400">We need to learn about you before building your plan. It takes 15–20 minutes.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
              <p className="text-slate-400">Sign in to access your personalized fitness program.</p>
            </>
          )}
        </div>

        <div className="card">
          <div className="flex bg-surface-elevated rounded-xl p-1 mb-6">
            {(['register', 'login'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t ? 'bg-surface-card text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {t === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            ))}
          </div>

          {/* No quiz data warning for register tab */}
          {tab === 'register' && !hasQuizData && (
            <div className="mb-6 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <ClipboardList size={20} className="text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1">Complete the assessment first</div>
                  <p className="text-xs text-slate-400">Your account will be built around your quiz results — fitness goals, health conditions, diet, and more. The quiz takes 15–20 minutes.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                Start the Assessment <ArrowRight size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && !hasQuizData ? null : tab === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="input-field pl-10"
                  required
                />
              </div>
            )}
            {(tab === 'login' || hasQuizData) && (
              <>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="input-field pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="input-field pl-10 pr-10"
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                  {loading ? 'Please wait...' : tab === 'register' ? 'Create My Account' : 'Sign In'}
                </button>
              </>
            )}
          </form>

          {(tab === 'login' || hasQuizData) && <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative text-center">
              <span className="px-3 bg-surface-card text-slate-500 text-xs">or continue with</span>
            </div>
          </div>}

          {(tab === 'login' || hasQuizData) && <div className="grid grid-cols-2 gap-3">
            {['Google', 'Facebook'].map(provider => (
              <button
                key={provider}
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: provider.toLowerCase() as 'google' | 'facebook',
                    options: { redirectTo: window.location.origin + '/subscription' }
                  })
                }}
                className="btn-secondary py-3 text-sm flex items-center justify-center gap-2"
              >
                {provider === 'Google' ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                {provider}
              </button>
            ))}
          </div>}

          <p className="text-xs text-slate-500 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
