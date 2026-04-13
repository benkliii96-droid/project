import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Dumbbell, Target, Activity, Clock, MapPin, Heart, Shield, Star, ChevronRight, Edit3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import type { QuizData, WorkoutLog } from '../types'

interface ProfileStats {
  totalWorkouts: number
  streak: number
  totalMinutes: number
  memberSince: string | null
}

const goalLabels: Record<string, string> = {
  build_muscle: 'Build Muscle',
  lose_weight: 'Lose Weight',
  recomposition: 'Body Recomposition',
  improve_fitness: 'Improve Fitness',
}

const bodyGoalLabels: Record<string, string> = {
  athletic: '⚡ Athletic',
  shredded: '🔥 Shredded',
  swole: '💪 Strong & Powerful',
  smaller: '📉 Noticeably Slimmer',
}

const fitnessLevelLabels: Record<string, string> = {
  beginner: '🌱 Beginner',
  intermediate: '🚶 Intermediate',
  advanced: '💪 Above Average',
  professional: '🏆 Experienced',
}

const motivationLabels: Record<string, string> = {
  family: '👨‍👩‍👧 For my family',
  health: "❤️ Doctor's recommendation",
  confidence: '💎 Personal confidence',
  energy: '⚡ Energy & vitality',
  longevity: '🏆 Long, active life',
}

const obstacleLabels: Record<string, string> = {
  no_time: "⏰ Not enough time",
  no_motivation: '😔 Lost motivation',
  injury: '🩹 Injuries',
  no_guidance: "🗺️ No clear plan",
  nothing: '✨ First time starting',
}

const durationLabels: Record<string, string> = {
  '20_30': '20–30 minutes',
  '30_45': '30–45 minutes',
  '45_60': '45–60 minutes',
  '60_plus': '60+ minutes',
}

const formatLabels: Record<string, string> = {
  gym: '🏋️ Gym',
  home: '🏠 Home Workouts',
  outdoor: '🌲 Outdoor / Calisthenics',
}

function InfoRow({ label, value, icon }: { label: string; value: string | number | undefined | null; icon?: React.ReactNode }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-border last:border-0">
      {icon && <div className="text-slate-500 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-slate-200">{value}</div>
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
          {icon}
        </div>
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="px-5">{children}</div>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user, hasSubscription } = useAuth()
  const [quizData, setQuizData] = useState<Partial<QuizData> | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ totalWorkouts: 0, streak: 0, totalMinutes: 0, memberSince: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('quiz_data')
    if (stored) {
      try { setQuizData(JSON.parse(stored)) } catch { }
    }
    if (user?.id) {
      loadStats(user.id)
    }
    setLoading(false)
  }, [user])

  const loadStats = async (userId: string) => {
    try {
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('completed_at, duration_minutes')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })

      if (logs && logs.length > 0) {
        const totalMinutes = logs.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0)
        // calculate streak
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const days = new Set(logs.map((l: any) => new Date(l.completed_at).toDateString()))
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          if (days.has(d.toDateString())) streak++
          else if (i > 0) break
        }
        setStats(prev => ({ ...prev, totalWorkouts: logs.length, streak, totalMinutes }))
      }
    } catch (e) {
      console.warn('Could not load stats:', e)
    }
  }

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null

  const bmi = quizData?.heightCm && quizData?.weightKg
    ? (quizData.weightKg / Math.pow(quizData.heightCm / 100, 2)).toFixed(1)
    : null

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">My Profile</h1>
          <p className="text-slate-400 text-sm">Your personal dashboard — all your data in one place</p>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-brand-500/10 to-cyan-500/5 border border-brand-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xl shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{fullName}</h2>
              <p className="text-slate-400 text-sm truncate">{user?.email}</p>
              {memberSince && <p className="text-xs text-slate-500 mt-1">Member since {memberSince}</p>}
            </div>
            <div className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${hasSubscription ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-elevated text-slate-400 border border-surface-border'}`}>
              {hasSubscription ? '✓ Active Plan' : 'Free'}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Workouts', value: stats.totalWorkouts, icon: '💪' },
            { label: 'Day Streak', value: stats.streak, icon: '🔥' },
            { label: 'Minutes', value: stats.totalMinutes, icon: '⏱️' },
          ].map(s => (
            <div key={s.label} className="bg-surface-card border border-surface-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Body Profile */}
        {quizData && (quizData.heightCm || quizData.weightKg || quizData.age) && (
          <SectionCard title="Body Profile" icon={<User size={16} />}>
            <InfoRow label="Age" value={quizData.age ? `${quizData.age} years old` : undefined} />
            <InfoRow label="Gender" value={quizData.gender ? quizData.gender.charAt(0).toUpperCase() + quizData.gender.slice(1) : undefined} />
            <InfoRow label="Height" value={quizData.heightCm ? `${quizData.heightCm} cm` : undefined} />
            <InfoRow label="Weight" value={quizData.weightKg ? `${quizData.weightKg} kg` : undefined} />
            {bmi && <InfoRow label="BMI" value={bmi} />}
          </SectionCard>
        )}

        {/* Fitness Profile */}
        {quizData && (quizData.trainingGoal || quizData.fitnessLevel || quizData.trainingFormat) && (
          <SectionCard title="Fitness Profile" icon={<Dumbbell size={16} />}>
            <InfoRow label="Primary Goal" value={quizData.trainingGoal ? goalLabels[quizData.trainingGoal] : undefined} icon={<Target size={14} />} />
            <InfoRow label="Body Goal" value={quizData.bodyGoal ? bodyGoalLabels[quizData.bodyGoal] : undefined} icon={<Star size={14} />} />
            <InfoRow label="Fitness Level" value={quizData.fitnessLevel ? fitnessLevelLabels[quizData.fitnessLevel] : undefined} icon={<Activity size={14} />} />
            <InfoRow label="Training Frequency" value={quizData.trainingFrequency ? `${quizData.trainingFrequency}x per week` : undefined} icon={<Calendar size={14} />} />
            <InfoRow label="Training Environment" value={quizData.trainingFormat ? formatLabels[quizData.trainingFormat] : undefined} icon={<MapPin size={14} />} />
            <InfoRow label="Session Duration" value={quizData.sessionDuration ? durationLabels[quizData.sessionDuration] : undefined} icon={<Clock size={14} />} />
          </SectionCard>
        )}

        {/* Motivation */}
        {quizData && (quizData.primaryMotivation || quizData.previousObstacle) && (
          <SectionCard title="Your Journey" icon={<Heart size={16} />}>
            <InfoRow label="Primary Motivation" value={quizData.primaryMotivation ? motivationLabels[quizData.primaryMotivation] : undefined} />
            <InfoRow label="Previous Challenge" value={quizData.previousObstacle ? obstacleLabels[quizData.previousObstacle] : undefined} />
          </SectionCard>
        )}

        {/* Health & Safety */}
        {quizData && quizData.medicalConditions && quizData.medicalConditions.length > 0 && (
          <SectionCard title="Health & Safety" icon={<Shield size={16} />}>
            <div className="py-3">
              <div className="text-xs text-slate-500 mb-2">Conditions noted for safe programming</div>
              <div className="flex flex-wrap gap-2">
                {quizData.medicalConditions.map(c => (
                  <span key={c} className="text-xs bg-surface-elevated border border-surface-border px-2.5 py-1 rounded-lg text-slate-300">{c}</span>
                ))}
              </div>
            </div>
            {quizData.medicalNotes && (
              <div className="py-3 border-t border-surface-border">
                <div className="text-xs text-slate-500 mb-1">Additional notes</div>
                <div className="text-sm text-slate-300">{quizData.medicalNotes}</div>
              </div>
            )}
          </SectionCard>
        )}

        {/* Account */}
        <SectionCard title="Account" icon={<Mail size={16} />}>
          <InfoRow label="Email" value={user?.email} icon={<Mail size={14} />} />
          <InfoRow label="Member Since" value={memberSince || undefined} icon={<Calendar size={14} />} />
          <InfoRow
            label="Plan Status"
            value={hasSubscription ? 'Active Subscription' : 'No active plan'}
            icon={<Star size={14} />}
          />
        </SectionCard>

        {/* Retake quiz CTA */}
        {!quizData?.trainingGoal && (
          <motion.a
            href="/quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl hover:bg-brand-500/15 transition-colors"
          >
            <div>
              <div className="font-semibold text-brand-400 text-sm">Complete your profile</div>
              <div className="text-xs text-slate-400 mt-0.5">Take the quiz to get your personalized plan</div>
            </div>
            <ChevronRight size={18} className="text-brand-400" />
          </motion.a>
        )}

        <div className="h-6" />
      </div>
    </DashboardLayout>
  )
}
