import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Play, Flame, Trophy, Calendar, ChevronRight, Coffee, Dumbbell, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateWorkoutPlanAI } from '../lib/openai'
import { generateWorkoutPlan } from '../lib/mockData'
import DashboardLayout from '../components/DashboardLayout'
import type { WorkoutPlan } from '../types'

// localStorage cache for workout plan — survives logout/reload without DB access
const WORKOUT_CACHE_KEY = 'fitcoach_workout_plan'
function saveWorkoutToCache(plan: WorkoutPlan) { localStorage.setItem(WORKOUT_CACHE_KEY, JSON.stringify(plan)) }
function loadWorkoutFromCache(): WorkoutPlan | null {
  try { return JSON.parse(localStorage.getItem(WORKOUT_CACHE_KEY) || 'null') } catch { return null }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const today = new Date()
  const todayDayName = format(today, 'EEEE')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Check localStorage cache first — works even if DB write previously failed
      const cached = loadWorkoutFromCache()
      if (cached) setPlan(cached)

      // limit(1) instead of maybeSingle() — handles duplicate rows from old upsert bug
      const { data: planRows } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      const planData = planRows?.[0] ?? null

      if (planData) {
        const dbPlan = planData.plan_data as WorkoutPlan
        setPlan(dbPlan)
        saveWorkoutToCache(dbPlan) // keep cache fresh from DB
      } else if (!cached) {
        setPlan(null) // genuinely no plan
      }

      const { data: logs } = await supabase
        .from('workout_logs')
        .select('id, completed_at, workout_name')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })

      if (logs) {
        setTotalWorkouts(logs.length)
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        const weekIds = logs
          .filter(l => new Date(l.completed_at) > weekAgo)
          .map(l => l.workout_name)
        setCompletedIds(weekIds)

        let s = 0
        const sorted = [...logs].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
        let prevDate: Date | null = null
        for (const log of sorted) {
          const d = new Date(log.completed_at)
          d.setHours(0, 0, 0, 0)
          if (!prevDate) { s = 1; prevDate = d; continue }
          const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
          if (diff <= 1) { s++; prevDate = d } else break
        }
        setStreak(s)
      }
    } finally {
      setLoading(false)
    }
  }

  const generatePlan = async () => {
    if (!user || generating) return
    setGenerating(true)
    try {
      const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')
      const newPlan = await generateWorkoutPlanAI(quizData).catch(() => generateWorkoutPlan(quizData))
      await supabase.from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
      const { error: insertError } = await supabase.from('workout_plans').insert({
        user_id: user.id,
        name: newPlan.name,
        description: newPlan.description,
        weeks_duration: newPlan.weeksDuration,
        plan_data: newPlan,
        is_active: true,
      })
      if (insertError) console.error('[WorkoutPlan] DB insert failed:', insertError.message)
      setPlan(newPlan)
      saveWorkoutToCache(newPlan) // persist locally so logout/reload doesn't lose the plan
    } finally {
      setGenerating(false)
    }
  }

  const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Champion'

  const todayWorkout = plan?.days?.find(d => d.dayName === todayDayName)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-card rounded-2xl" />)}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-sm">{format(today, 'EEEE, MMMM d')}</div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {userName}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-semibold">{streak} day streak</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Workouts', value: totalWorkouts, icon: Trophy, color: 'text-yellow-400' },
            { label: 'This Week', value: completedIds.length, icon: Calendar, color: 'text-brand-400' },
            { label: 'Day Streak', value: streak, icon: Flame, color: 'text-orange-400' },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {todayWorkout && !todayWorkout.isRest && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent">
            <div className="section-label mb-2">Today's Workout</div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">{todayWorkout.focus}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{todayWorkout.exercises.length - 2} exercises</span>
                  <span>{todayWorkout.durationMinutes} min</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/workout/${todayWorkout.id}`)}
                className="btn-primary flex items-center gap-2 px-5 py-3"
              >
                <Play size={16} /> Start
              </button>
            </div>
          </motion.div>
        )}

        {todayWorkout?.isRest && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card border-slate-700/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700/40 flex items-center justify-center">
                <Coffee size={22} className="text-slate-500" />
              </div>
              <div>
                <div className="font-semibold">Rest Day</div>
                <div className="text-sm text-slate-400">Recovery is where the gains happen. Take it easy today.</div>
              </div>
            </div>
          </motion.div>
        )}

        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Weekly Schedule</h2>
              <div className="section-label">{plan.name}</div>
            </div>
            <div className="space-y-3">
              {plan.days?.map((day) => (
                <div key={day.id} className={`card flex items-center gap-4 ${day.dayName === todayDayName ? 'border-brand-500/30' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${day.isRest ? 'bg-surface-elevated' : 'bg-brand-500/10'}`}>
                    {day.isRest ? (
                      <Coffee size={20} className="text-slate-600" />
                    ) : (
                      <Dumbbell size={20} className="text-brand-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{day.dayName}</span>
                      {day.dayName === todayDayName && <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Today</span>}
                      {completedIds.includes(day.focus) && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Done</span>}
                    </div>
                    <div className="text-xs text-slate-400">{day.isRest ? 'Rest & Recovery' : `${day.focus} · ${day.durationMinutes} min`}</div>
                  </div>
                  {!day.isRest && (
                    <button
                      onClick={() => navigate(`/dashboard/workout/${day.id}`)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
              <Dumbbell size={28} className="text-brand-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">No workout plan yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              {localStorage.getItem('quiz_data')
                ? 'Generate your personalized AI workout plan based on your assessment.'
                : 'Your profile data will be loaded automatically. Click below to generate your plan.'}
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto"
            >
              {generating
                ? <><RefreshCw size={16} className="animate-spin" /> Generating your plan…</>
                : <><Dumbbell size={16} /> Generate My Plan</>}
            </button>
          </motion.div>
        )}

        {quizData.trainingGoal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div className="section-label mb-3">Your Goal</div>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{
                quizData.trainingGoal === 'build_muscle' ? '💪' :
                quizData.trainingGoal === 'lose_weight' ? '🔥' :
                quizData.trainingGoal === 'recomposition' ? '⚡' : '🏃'
              }</div>
              <div>
                <div className="font-bold capitalize">{quizData.trainingGoal?.replace('_', ' ')}</div>
                <div className="text-sm text-slate-400">Training {quizData.trainingFrequency}x per week · {quizData.trainingFormat}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
