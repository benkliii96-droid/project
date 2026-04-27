import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CircleCheck as CheckCircle, Clock, Dumbbell, Brain, Utensils, TrendingUp, MessageCircle, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { payments, type PlanId } from '../lib/payments'

const ONE_HOUR = 60 * 60

function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  useEffect(() => {
    const key = 'fitcoach_offer_expiry'
    const stored = localStorage.getItem(key)
    const expiry = stored ? parseInt(stored) : Date.now() + seconds * 1000
    if (!stored) localStorage.setItem(key, expiry.toString())
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000))
      setTimeLeft(remaining)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [seconds])
  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60
  return { h, m, s, expired: timeLeft === 0 }
}

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { user, subChecked, hasSubscription } = useAuth()
  const { h, m, s } = useCountdown(ONE_HOUR)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')

  useEffect(() => {
    if (subChecked && hasSubscription) navigate('/dashboard', { replace: true })
  }, [subChecked, hasSubscription])

  const handleCheckout = async (planId: PlanId) => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const origin = window.location.origin
      const { url } = await payments.createCheckout({
        planId,
        userId: user.id,
        email: user.email ?? '',
        successUrl: `${origin}/payment/success`,
        cancelUrl: `${origin}/subscription`,
      })
      // Paddle opens an overlay — url will be null.
      // Other providers may return a redirect URL.
      if (url) window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  const features = [
    { icon: Brain, label: 'AI Personal Trainer', desc: 'Workouts personalized to your age and fitness level' },
    { icon: Utensils, label: 'Nutrition Planning', desc: 'Daily meal plans with diverse, anti-inflammatory recipes' },
    { icon: TrendingUp, label: 'Progress Tracking', desc: 'Visual logs, streaks, and milestone celebrations' },
    { icon: MessageCircle, label: '3 AI Coaches', desc: 'Trainer, Nutritionist & Sports Psychologist' },
    { icon: Zap, label: 'Live Workout Mode', desc: 'Guided sessions with exercise instructions & timers' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a15] px-6 py-12 bg-mesh">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Dumbbell size={20} className="text-slate-900" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-4">
            <CheckCircle size={14} className="text-brand-400" />
            <span className="text-sm text-brand-400 font-medium">Your personalized plan is ready!</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Your AI Fitness Team is Waiting</h1>
          <p className="text-slate-400 text-lg">
            Based on your profile, we've built a complete {quizData.trainingGoal?.replace('_', ' ')} program tailored for you.
          </p>
        </motion.div>

        {quizData.trainingGoal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-6">
            <div className="section-label mb-3">Your Profile Summary</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Age', value: quizData.age ? `${quizData.age} yrs` : '—' },
                { label: 'Goal', value: quizData.trainingGoal?.replace('_', ' ') || '—' },
                { label: 'Level', value: quizData.fitnessLevel || '—' },
                { label: 'Format', value: quizData.trainingFormat || '—' },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-surface-elevated rounded-xl">
                  <div className="text-slate-400 text-xs mb-1">{item.label}</div>
                  <div className="font-semibold text-sm capitalize">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card mb-6">
          <div className="section-label mb-4">What You Get</div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <f.icon size={18} className="text-brand-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.label}</div>
                  <div className="text-slate-400 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card border-brand-500/40 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Special offer expires in:</span>
            <div className="flex gap-1 ml-auto">
              {[h.toString().padStart(2,'0'), m.toString().padStart(2,'0'), s.toString().padStart(2,'0')].map((t, i) => (
                <span key={i} className={`bg-surface-elevated border border-surface-border rounded-lg px-2 py-1 font-mono text-sm font-bold ${i < 2 ? 'mr-1' : ''}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center py-4">
            <div className="text-5xl font-black gradient-text mb-2">$9</div>
            <div className="text-slate-400 text-sm mb-1">14-day full access</div>
            <div className="text-slate-500 text-xs">One-time payment — no hidden charges</div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={() => handleCheckout('trial')}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg mb-3"
          >
            {loading ? 'Redirecting to payment…' : 'Start My Transformation — $9'}
          </button>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-brand-400" /> Secure payment</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-brand-400" /> Cancel anytime</span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
