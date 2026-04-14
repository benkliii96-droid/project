import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CircleCheck as CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateWorkoutPlanAI } from '../lib/openai'
import { generateWorkoutPlan, generateWeekMealPlans } from '../lib/mockData'

const MAX_POLLS = 12 // 12 × 2 s = 24 s

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { user, setHasSubscription } = useAuth()
  const [status, setStatus] = useState<'polling' | 'activating' | 'done' | 'timeout'>('polling')

  useEffect(() => {
    if (!user) return

    let attempts = 0

    const poll = async () => {
      attempts++

      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.status === 'active' || data?.status === 'trial') {
        // Subscription confirmed in DB — provision user data
        setStatus('activating')
        await provisionUserData()
        setHasSubscription(true)
        setStatus('done')
        setTimeout(() => navigate('/dashboard'), 1500)
        return
      }

      if (attempts >= MAX_POLLS) {
        setStatus('timeout')
        return
      }

      setTimeout(poll, 2000)
    }

    poll()
  }, [user])

  const provisionUserData = async () => {
    if (!user) return
    const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')

    // Workout plan
    const existing = await supabase
      .from('workout_plans')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing.data) {
      const cached = localStorage.getItem('ai_workout_plan')
      const wpPlan = cached
        ? JSON.parse(cached)
        : await generateWorkoutPlanAI(quizData).catch(() => generateWorkoutPlan(quizData))
      localStorage.removeItem('ai_workout_plan')

      await supabase.from('workout_plans').insert({
        user_id: user.id,
        name: wpPlan.name,
        description: wpPlan.description,
        weeks_duration: wpPlan.weeksDuration,
        plan_data: wpPlan,
        is_active: true,
      })
    }

    // Seed initial meal plans (7 days mock, AI generates on demand later)
    const mealPlans = generateWeekMealPlans(quizData)
    for (const mp of mealPlans) {
      await supabase
        .from('meal_plans')
        .upsert({
          user_id: user.id,
          plan_date: mp.date,
          meals: mp.meals,
          total_calories: mp.totalCalories,
          total_protein: mp.totalProtein,
          total_carbs: mp.totalCarbs,
          total_fat: mp.totalFat,
        })
        .select()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a15] flex items-center justify-center px-6 bg-mesh">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full text-center py-12"
      >
        {status === 'done' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-slate-400">Taking you to your dashboard…</p>
          </>
        ) : status === 'timeout' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Received</h1>
            <p className="text-slate-400 mb-6">
              Your payment was processed. It may take a moment to activate your account.
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-3">
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <Loader2 size={36} className="text-brand-400 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">
              {status === 'activating' ? 'Setting up your program…' : 'Confirming payment…'}
            </h1>
            <p className="text-slate-400">This only takes a moment.</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
