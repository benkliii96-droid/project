import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Trophy, Flame, Calendar, TrendingUp, CircleCheck as CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'

interface WorkoutLog {
  id: string
  workout_name: string
  completed_at: string
  duration_minutes: number
  exercises_data: unknown[]
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  const loadLogs = async () => {
    try {
      const { data } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
      setLogs(data || [])
    } finally {
      setLoading(false)
    }
  }

  const thisWeekLogs = logs.filter(l => {
    const d = new Date(l.completed_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d > weekAgo
  })


  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

  const getStreak = () => {
    if (logs.length === 0) return 0
    let streak = 0
    const sorted = [...logs].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    let prevDate: Date | null = null
    for (const log of sorted) {
      const d = new Date(log.completed_at)
      d.setHours(0, 0, 0, 0)
      if (!prevDate) { streak = 1; prevDate = d; continue }
      const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      if (diff <= 1) { streak++; prevDate = d } else break
    }
    return streak
  }

  const nextMilestone = Math.ceil((logs.length + 1) / 3) * 3
  const toNextMilestone = nextMilestone - logs.length

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-card rounded-2xl" />)}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">
          Your Progress
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Workouts', value: logs.length, icon: Trophy, color: 'text-yellow-400' },
            { label: 'This Week', value: thisWeekLogs.length, icon: Calendar, color: 'text-brand-400' },
            { label: 'Day Streak', value: getStreak(), icon: Flame, color: 'text-orange-400' },
            { label: 'Total Minutes', value: totalMinutes, icon: Clock, color: 'text-cyan-400' },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div className="section-label mb-4">Last 7 Days</div>
          <div className="flex gap-2">
            {last7Days.map((day, i) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const hasWorkout = logs.some(l => l.completed_at?.startsWith(dayStr))
              const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${hasWorkout ? 'bg-brand-500 shadow-brand' : 'bg-surface-elevated'}`}>
                    {hasWorkout && <CheckCircle size={16} className="text-slate-900" />}
                  </div>
                  <span className={`text-xs ${isToday ? 'text-brand-400 font-semibold' : 'text-slate-500'}`}>
                    {format(day, 'EEE')}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card border-brand-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <TrendingUp size={22} className="text-brand-400" />
            </div>
            <div>
              <div className="font-semibold">Next Milestone</div>
              <div className="text-sm text-slate-400">
                {toNextMilestone === 0 ? 'Milestone reached! Check your rewards.' : `${toNextMilestone} more workout${toNextMilestone !== 1 ? 's' : ''} to unlock your next milestone`}
              </div>
            </div>
            <div className="ml-auto text-2xl font-black gradient-text">{nextMilestone}</div>
          </div>
          {toNextMilestone > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{logs.length} completed</span>
                <span>{nextMilestone} goal</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${(logs.length / nextMilestone) * 100}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-bold text-lg mb-4">Workout History</h2>
          {logs.length === 0 ? (
            <div className="card text-center py-12">
              <Trophy size={40} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No workouts logged yet. Start your first workout from the dashboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle size={18} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{log.workout_name}</div>
                    <div className="text-xs text-slate-400">
                      {format(parseISO(log.completed_at), 'EEEE, MMMM d · h:mm a')}
                    </div>
                  </div>
                  {log.duration_minutes > 0 && (
                    <div className="text-xs text-brand-400 font-semibold shrink-0">{log.duration_minutes} min</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
