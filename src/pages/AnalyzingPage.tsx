import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CircleCheck as CheckCircle, Dumbbell } from 'lucide-react'
import { generateWorkoutPlanAI } from '../lib/openai'

const analysisSteps = [
  { label: 'Analyzing body composition & measurements...', delay: 1500 },
  { label: 'Calculating optimal training load for your age...', delay: 5000 },
  { label: 'Personalizing nutrition plan & calorie targets...', delay: 10000 },
  { label: 'Building your complete fitness program with AI...', delay: 16000 },
  { label: 'Finalizing your personalized recommendations...', delay: 21000 },
]

const DURATION = 26000

export default function AnalyzingPage() {
  const navigate = useNavigate()
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const generationStarted = useRef(false)

  useEffect(() => {
    // Start AI generation in the background immediately
    if (!generationStarted.current) {
      generationStarted.current = true
      const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')

      if (quizData.trainingGoal) {
        generateWorkoutPlanAI(quizData)
          .then(plan => {
            localStorage.setItem('ai_workout_plan', JSON.stringify(plan))
          })
          .catch(e => console.warn('Background workout generation failed:', e))
      }
    }

    // Animate steps
    const timers = analysisSteps.map((s, i) =>
      setTimeout(() => setCompletedSteps(prev => [...prev, i]), s.delay)
    )

    // Navigate after animation
    const navTimer = setTimeout(() => navigate('/register'), DURATION)

    // Smooth progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (DURATION / 100))
        return next >= 100 ? 100 : next
      })
    }, 100)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(navTimer)
      clearInterval(interval)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0a0a15] flex flex-col items-center justify-center px-6 bg-mesh">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="relative mb-10 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
            <Brain size={42} className="text-brand-400" />
          </div>
          <div className="absolute w-28 h-28 rounded-full bg-brand-500/5 pulse-ring" />
        </div>

        <h1 className="text-3xl font-bold mb-3">AI is analyzing your profile</h1>
        <p className="text-slate-400 mb-10">
          Building your personalized plan based on your 14 answers...
        </p>

        <div className="w-full bg-surface-elevated rounded-full h-2 mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4 text-left">
          {analysisSteps.map((step, i) => (
            <AnimatePresence key={i}>
              {(completedSteps.includes(i) || i === completedSteps.length) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {completedSteps.includes(i) ? (
                    <CheckCircle size={18} className="text-brand-400 shrink-0" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0" />
                  )}
                  <span className={`text-sm ${completedSteps.includes(i) ? 'text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-slate-600 text-xs">
          <Dumbbell size={12} />
          <span>FitCoach AI — Personalized for Adults 45+</span>
        </div>
      </motion.div>
    </div>
  )
}
