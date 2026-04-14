import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, CircleCheck as CheckCircle, Clock, ChevronLeft, Share2, Trophy } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getMotivationalMessage } from '../lib/mockData'
import type { WorkoutPlan, Exercise } from '../types'
import DashboardLayout from '../components/DashboardLayout'
import ExerciseCamera from '../components/ExerciseCamera'
import ExerciseDemo from '../components/ExerciseDemo'

function RestTimer({ seconds, onFinish }: { seconds: number; onFinish: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (remaining === 0) { onFinish(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, paused, onFinish])

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface-card border border-surface-border rounded-3xl p-10 text-center max-w-xs w-full mx-4">
        <div className="section-label mb-4">Rest Timer</div>
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a40" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="#00c9a0" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black">{remaining}s</span>
          </div>
        </div>
        <button onClick={() => setPaused(p => !p)} className="btn-secondary w-full mb-3 flex items-center justify-center gap-2 py-3">
          {paused ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
        </button>
        <button onClick={onFinish} className="text-slate-500 hover:text-white text-sm transition-colors">
          Skip rest
        </button>
      </motion.div>
    </div>
  )
}

function MilestoneModal({ count, onClose, onShare }: { count: number; onClose: () => void; onShare: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface-card border border-brand-500/40 rounded-3xl p-8 text-center max-w-sm w-full mx-4">
        <div className="text-6xl mb-4">🏆</div>
        <div className="gradient-text text-2xl font-black mb-2">{count} Workouts!</div>
        <p className="text-slate-400 mb-6">You've completed {count} workouts — that's incredible consistency. This is what separates winners from dreamers.</p>
        <button onClick={onShare} className="btn-primary w-full mb-3 flex items-center justify-center gap-2 py-3">
          <Share2 size={16} /> Share This Milestone
        </button>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-sm">Continue training</button>
      </motion.div>
    </div>
  )
}

export default function WorkoutSessionPage() {
  const { dayId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [showRest, setShowRest] = useState(false)
  const [restDuration, setRestDuration] = useState(90)
  const [completed, setCompleted] = useState(false)
  const [startTime] = useState(Date.now())
  const [showMilestone, setShowMilestone] = useState(false)
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(true)

  useEffect(() => {
    loadPlan()
    loadWorkoutCount()
  }, [user])

  useEffect(() => {
    if (!timerActive || completed) return
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [timerActive, completed])

  const loadPlan = async () => {
    if (!user) return
    const { data } = await supabase.from('workout_plans').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle()
    if (data) setPlan(data.plan_data as WorkoutPlan)
  }

  const loadWorkoutCount = async () => {
    if (!user) return
    const { count } = await supabase.from('workout_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    setTotalCompleted(count || 0)
  }

  const workout = plan?.days?.find(d => d.id === dayId)
  const exercises: Exercise[] = workout?.exercises || []
  const currentEx = exercises[currentExIdx]

  const handleCompleteSet = useCallback(() => {
    if (!currentEx) return
    if (currentSet < currentEx.sets) {
      setCurrentSet(s => s + 1)
      setShowRest(true)
      setTimerActive(false)
    } else {
      if (currentExIdx < exercises.length - 1) {
        setCurrentExIdx(i => i + 1)
        setCurrentSet(1)
        setShowRest(true)
        setTimerActive(false)
      } else {
        finishWorkout()
      }
    }
  }, [currentEx, currentSet, currentExIdx, exercises.length])

  const finishWorkout = async () => {
    setCompleted(true)
    setTimerActive(false)
    const duration = Math.round((Date.now() - startTime) / 60000)
    if (user && workout) {
      const { data: planData } = await supabase.from('workout_plans').select('id').eq('user_id', user.id).maybeSingle()
      await supabase.from('workout_logs').insert({
        user_id: user.id,
        workout_plan_id: planData?.id || null,
        workout_name: workout.focus,
        exercises_data: exercises,
        duration_minutes: duration,
      })
      const newCount = totalCompleted + 1
      setTotalCompleted(newCount)
      if (newCount > 0 && newCount % 3 === 0) {
        setShowMilestone(true)
      }
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading workout...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!workout) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">Workout not found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
        </div>
      </DashboardLayout>
    )
  }

  if (completed) {
    return (
      <DashboardLayout>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-brand-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Workout Complete!</h1>
          <p className="text-slate-400 mb-6">{getMotivationalMessage(totalCompleted)}</p>
          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{formatTime(elapsedSeconds)}</div>
              <div className="text-xs text-slate-400">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{exercises.length - 2}</div>
              <div className="text-xs text-slate-400">Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{totalCompleted}</div>
              <div className="text-xs text-slate-400">Total Done</div>
            </div>
          </div>
          <button onClick={() => {
            const text = `Just crushed workout #${totalCompleted} on FitCoach AI! ${getMotivationalMessage(totalCompleted)}`
            navigator.share ? navigator.share({ text }) : alert(text)
          }} className="btn-secondary w-full mb-3 flex items-center justify-center gap-2 py-3">
            <Share2 size={16} /> Share Progress
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-3">
            Back to Dashboard
          </button>
        </motion.div>
        {showMilestone && (
          <MilestoneModal
            count={totalCompleted}
            onClose={() => setShowMilestone(false)}
            onShare={() => {
              const text = `I've completed ${totalCompleted} workouts on FitCoach AI! Building my best body at 50+.`
              navigator.share ? navigator.share({ text }) : alert(text)
            }}
          />
        )}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {showRest && (
        <RestTimer
          seconds={restDuration}
          onFinish={() => { setShowRest(false); setTimerActive(true) }}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-2 text-brand-400">
            <Clock size={16} />
            <span className="font-mono text-sm">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Exercise {currentExIdx + 1} of {exercises.length}</span>
            <span>{workout.focus}</span>
          </div>
          <div className="w-full bg-surface-elevated rounded-full h-1.5">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentExIdx + 1) / exercises.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentExIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {currentEx && (
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="section-label">{currentEx.muscleGroup}</span>
                  <span className="text-sm text-slate-400">Set {currentSet} of {currentEx.sets}</span>
                </div>

                <h2 className="text-3xl font-black mb-2">{currentEx.name}</h2>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1 text-center p-3 bg-surface-elevated rounded-xl">
                    <div className="text-2xl font-bold gradient-text">{currentEx.sets}</div>
                    <div className="text-xs text-slate-400">Sets</div>
                  </div>
                  <div className="flex-1 text-center p-3 bg-surface-elevated rounded-xl">
                    <div className="text-2xl font-bold gradient-text">{currentEx.reps}</div>
                    <div className="text-xs text-slate-400">Reps</div>
                  </div>
                  <div className="flex-1 text-center p-3 bg-surface-elevated rounded-xl">
                    <div className="text-2xl font-bold gradient-text">{currentEx.restSeconds}s</div>
                    <div className="text-xs text-slate-400">Rest</div>
                  </div>
                </div>

                <div className="p-4 bg-surface-elevated rounded-xl mb-4">
                  <div className="text-xs text-slate-400 mb-1">Instructions</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{currentEx.instructions}</p>
                </div>

                {/* Exercise demo animation + live camera tracking */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <ExerciseDemo exerciseName={currentEx.name} />
                  <ExerciseCamera
                    exerciseName={currentEx.name}
                    targetReps={typeof currentEx.reps === 'number' ? currentEx.reps : parseInt(currentEx.reps) || 10}
                  />
                </div>

                <div className="space-y-3">
                  <button onClick={handleCompleteSet} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    {currentSet < currentEx.sets ? `Complete Set ${currentSet}` : 'Complete Exercise'}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 text-center">Rest Duration</div>
                      <div className="flex gap-1">
                        {[60, 90, 120, 180].map(s => (
                          <button key={s} onClick={() => setRestDuration(s)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${restDuration === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-elevated text-slate-500'}`}>
                            {s}s
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setShowRest(true)} className="btn-secondary text-sm flex items-center justify-center gap-1 py-2">
                      <Pause size={14} /> Rest Now
                    </button>
                  </div>

                  <button onClick={() => {
                    if (currentExIdx < exercises.length - 1) {
                      setCurrentExIdx(i => i + 1)
                      setCurrentSet(1)
                    } else finishWorkout()
                  }} className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-1 transition-colors">
                    <SkipForward size={14} /> Skip Exercise
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 flex-wrap">
          {exercises.map((ex, i) => (
            <button key={ex.id} onClick={() => { setCurrentExIdx(i); setCurrentSet(1) }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${i === currentExIdx ? 'border-brand-500 bg-brand-500/10 text-brand-400' : i < currentExIdx ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-surface-border text-slate-500'}`}>
              {ex.muscleGroup}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={finishWorkout} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm py-2 px-4 rounded-lg hover:bg-surface-elevated transition-all">
            <Trophy size={14} /> Finish Workout Early
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
