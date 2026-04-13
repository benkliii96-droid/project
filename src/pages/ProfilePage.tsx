import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Calendar, Dumbbell, Target, Activity, Clock, MapPin, Heart, Shield, Star, ChevronRight, Lock, Eye, EyeOff, Check, X, Pencil, Camera } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import type { QuizData } from '../types'

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

const sleepLabels: Record<string, string> = {
  under_5: 'Less than 5 hours',
  '5_6': '5–6 hours',
  '6_7': '6–7 hours',
  '7_8': '7–8 hours',
  '8_plus': '8+ hours',
}

const dietLabels: Record<string, string> = {
  no_restrictions: '🍽️ No restrictions',
  low_carb: '🥩 Low carb / Keto',
  vegetarian: '🥗 Vegetarian',
  vegan: '🌱 Vegan',
  intermittent: '⏰ Intermittent fasting',
  mediterranean: '🫒 Mediterranean',
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

  // Name editing state
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameError, setNameError] = useState('')

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)

  const handleSaveName = async () => {
    if (!nameValue.trim()) { setNameError('Name cannot be empty'); return }
    setNameSaving(true)
    setNameError('')
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } })
    if (!error && user?.id) {
      await supabase.from('profiles').update({ full_name: nameValue.trim() }).eq('id', user.id)
    }
    setNameSaving(false)
    if (error) { setNameError(error.message) } else { setEditingName(false) }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarSaving(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const dataUrl = reader.result as string
      setAvatarUrl(dataUrl)
      localStorage.setItem('profile_avatar', dataUrl)
      // Optionally store in Supabase profiles table
      if (user?.id) {
        await supabase.from('profiles').update({ avatar_url: dataUrl }).eq('id', user.id)
      }
      setAvatarSaving(false)
    }
    reader.readAsDataURL(file)
  }

  // Password change state
  const [pwOpen, setPwOpen] = useState(false)
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwShowNew, setPwShowNew] = useState(false)
  const [pwShowConfirm, setPwShowConfirm] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwStatus, setPwStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [pwError, setPwError] = useState('')

  const handleChangePassword = async () => {
    setPwError('')
    if (pwNew.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (pwNew !== pwConfirm) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    setPwLoading(false)
    if (error) {
      setPwError(error.message)
      setPwStatus('error')
    } else {
      setPwStatus('success')
      setPwNew('')
      setPwConfirm('')
      setTimeout(() => { setPwOpen(false); setPwStatus('idle') }, 2000)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('quiz_data')
    if (stored) {
      try { setQuizData(JSON.parse(stored)) } catch { }
    }
    const savedAvatar = localStorage.getItem('profile_avatar')
    if (savedAvatar) setAvatarUrl(savedAvatar)
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
  const initials = fullName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
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
            {/* Avatar with upload overlay */}
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xl">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              {/* Upload button */}
              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {avatarSaving
                  ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <Camera size={16} className="text-white" />
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarSaving} />
              </label>
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="space-y-1.5">
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                    className="input-field py-1.5 px-3 text-base font-semibold w-full"
                    placeholder="Your full name"
                  />
                  {nameError && <p className="text-xs text-red-400">{nameError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving}
                      className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-400 text-slate-900 font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {nameSaving ? <div className="w-3 h-3 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <Check size={12} />}
                      Save
                    </button>
                    <button onClick={() => { setEditingName(false); setNameError('') }} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold truncate">{fullName}</h2>
                  <button
                    onClick={() => { setNameValue(fullName); setEditingName(true); setNameError('') }}
                    className="text-slate-500 hover:text-brand-400 transition-colors shrink-0"
                    title="Edit name"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
              {!editingName && (
                <>
                  <p className="text-slate-400 text-sm truncate">{user?.email}</p>
                  {memberSince && <p className="text-xs text-slate-500 mt-0.5">Member since {memberSince}</p>}
                </>
              )}
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
            <InfoRow label="Sleep per Night" value={quizData.sleepHours ? sleepLabels[quizData.sleepHours] : undefined} icon={<Clock size={14} />} />
            <InfoRow label="Diet Style" value={quizData.dietType ? dietLabels[quizData.dietType] : undefined} icon={<Star size={14} />} />
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
          <div className="py-3">
            <button
              onClick={() => { setPwOpen(o => !o); setPwStatus('idle'); setPwError('') }}
              className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium"
            >
              <Lock size={14} />
              {pwOpen ? 'Cancel password change' : 'Change password'}
            </button>
            <AnimatePresence>
              {pwOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    {pwStatus === 'success' ? (
                      <div className="flex items-center gap-2 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                        <Check size={16} className="text-brand-400" />
                        <span className="text-sm text-brand-400 font-medium">Password updated successfully!</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            type={pwShowNew ? 'text' : 'password'}
                            placeholder="New password (min. 8 characters)"
                            value={pwNew}
                            onChange={e => setPwNew(e.target.value)}
                            className="input-field w-full pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setPwShowNew(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {pwShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={pwShowConfirm ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={pwConfirm}
                            onChange={e => setPwConfirm(e.target.value)}
                            className="input-field w-full pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setPwShowConfirm(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {pwShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {pwError && (
                          <div className="flex items-center gap-2 text-xs text-red-400">
                            <X size={12} /> {pwError}
                          </div>
                        )}
                        <button
                          onClick={handleChangePassword}
                          disabled={pwLoading || !pwNew || !pwConfirm}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${pwLoading || !pwNew || !pwConfirm ? 'bg-surface-elevated text-slate-600 cursor-not-allowed' : 'btn-primary'}`}
                        >
                          {pwLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
