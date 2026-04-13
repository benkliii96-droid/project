import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Dumbbell, Flame, Activity, Scale, Hop as Home, TreePine, Check, CircleAlert as AlertCircle, Camera, SkipForward, Heart, Shield, Clock, Users } from 'lucide-react'
import { useQuiz } from '../contexts/QuizContext'
import { supabase } from '../lib/supabase'

const TOTAL_STEPS = 14

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

function OptionCard({ selected, onClick, children, className = '' }: { selected?: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selected ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-elevated hover:border-brand-500/40'} ${className}`}
    >
      {children}
    </motion.button>
  )
}

function SocialProof({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function Step1({ quizData, setQuizData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 1 of 14</div>
        <h2 className="text-3xl font-bold mb-2">How old are you?</h2>
        <p className="text-slate-400">We'll tailor your program specifically to your age group and hormonal profile.</p>
      </div>
      <div className="p-3 bg-brand-500/5 border border-brand-500/15 rounded-xl">
        <div className="flex items-start gap-3">
          <Users size={16} className="text-brand-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300">Over <span className="text-brand-400 font-semibold">50,000 men 50+</span> have transformed their lives with FitCoach AI. You're in great company.</p>
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Your Age</label>
        <input
          type="number"
          min={40}
          max={99}
          value={quizData.age || ''}
          onChange={e => setQuizData({ age: parseInt(e.target.value) || 0 })}
          className="input-field text-3xl font-bold text-center h-20"
          placeholder="55"
        />
      </div>
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {['Male', 'Female'].map(g => (
            <OptionCard key={g} selected={quizData.gender === g.toLowerCase()} onClick={() => setQuizData({ gender: g.toLowerCase() })}>
              <div className="text-center font-semibold py-2">{g}</div>
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step2({ quizData, setQuizData }: any) {
  const bmi = quizData.heightCm && quizData.weightKg
    ? quizData.weightKg / Math.pow(quizData.heightCm / 100, 2)
    : null
  const getBmiLabel = (b: number) => {
    if (b < 18.5) return { label: 'Underweight', color: 'text-sky-400' }
    if (b < 25) return { label: 'Normal weight', color: 'text-brand-400' }
    if (b < 30) return { label: 'Overweight', color: 'text-amber-400' }
    return { label: 'Obese', color: 'text-red-400' }
  }
  const bmiInfo = bmi ? getBmiLabel(bmi) : null

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 2 of 14</div>
        <h2 className="text-3xl font-bold mb-2">Your measurements</h2>
        <p className="text-slate-400">This helps us calculate your caloric needs and create an accurate baseline to track your progress.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Height (cm)</label>
          <input
            type="number"
            min={140}
            max={220}
            value={quizData.heightCm || ''}
            onChange={e => setQuizData({ heightCm: parseFloat(e.target.value) || 0 })}
            className="input-field text-2xl font-bold text-center h-16"
            placeholder="175"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Weight (kg)</label>
          <input
            type="number"
            min={50}
            max={200}
            value={quizData.weightKg || ''}
            onChange={e => setQuizData({ weightKg: parseFloat(e.target.value) || 0 })}
            className="input-field text-2xl font-bold text-center h-16"
            placeholder="85"
          />
        </div>
      </div>
      <AnimatePresence>
        {bmi && bmiInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Your BMI</div>
              <div className={`text-xs font-medium ${bmiInfo.color}`}>{bmiInfo.label}</div>
            </div>
            <div className={`text-3xl font-bold ${bmiInfo.color}`}>{bmi.toFixed(1)}</div>
            <div className="text-xs text-slate-400 mt-2">No matter your starting point — our program is designed to meet you exactly where you are today.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step3({ quizData, setQuizData }: any) {
  const [showMotivation, setShowMotivation] = useState(!!quizData.trainingGoal)
  const goals = [
    { id: 'build_muscle', icon: Dumbbell, label: 'Build Muscle', desc: 'Gain strength and lean muscle mass', popular: false },
    { id: 'lose_weight', icon: Flame, label: 'Lose Weight', desc: 'Burn fat and get leaner', popular: true },
    { id: 'recomposition', icon: Scale, label: 'Body Recomposition', desc: 'Build muscle while losing fat simultaneously', popular: false },
    { id: 'improve_fitness', icon: Activity, label: 'Improve Fitness', desc: 'Boost energy, endurance, and overall health', popular: false },
  ]

  const motivationMessages: Record<string, string> = {
    build_muscle: "Great choice! Men over 50 who build muscle improve testosterone levels, bone density, and metabolic rate. Our strength protocols are optimized for exactly this.",
    lose_weight: "You're in good company — this is the #1 goal among men 50+ in our community. Our science-backed approach has helped thousands shed weight sustainably.",
    recomposition: "The ultimate transformation goal! It takes more precision, but our AI-driven programming makes it achievable for any fitness level.",
    improve_fitness: "A powerful choice. Improved fitness directly impacts energy, mood, sleep quality, and longevity — everything that makes life worth living.",
  }

  const handleSelect = (id: string) => {
    setQuizData({ trainingGoal: id })
    setShowMotivation(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 3 of 14</div>
        <h2 className="text-3xl font-bold mb-2">What's your main goal?</h2>
        <p className="text-slate-400">Your entire program will be built around this objective. Choose the one that excites you most.</p>
      </div>
      <div className="space-y-3">
        {goals.map(goal => (
          <OptionCard key={goal.id} selected={quizData.trainingGoal === goal.id} onClick={() => handleSelect(goal.id)}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quizData.trainingGoal === goal.id ? 'bg-brand-500' : 'bg-surface-card'}`}>
                <goal.icon size={20} className={quizData.trainingGoal === goal.id ? 'text-slate-900' : 'text-slate-400'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{goal.label}</span>
                  {goal.popular && <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Most Popular</span>}
                </div>
                <div className="text-sm text-slate-400">{goal.desc}</div>
              </div>
              {quizData.trainingGoal === goal.id && <Check size={18} className="text-brand-400 shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {showMotivation && quizData.trainingGoal && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <div className="text-brand-400 font-semibold mb-1">Perfect — you've chosen your path!</div>
            <div className="text-sm text-slate-300">{motivationMessages[quizData.trainingGoal]}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step4({ quizData, setQuizData }: any) {
  const [showMessage, setShowMessage] = useState(!!quizData.primaryMotivation)
  const motivations = [
    { id: 'family', icon: '👨‍👩‍👧', label: 'For my family', desc: 'Being there for the people I love most' },
    { id: 'health', icon: '❤️', label: "Doctor's recommendation", desc: 'Taking control of my health now' },
    { id: 'confidence', icon: '💎', label: 'Personal confidence', desc: 'Looking and feeling great about myself' },
    { id: 'energy', icon: '⚡', label: 'Energy & vitality', desc: 'Having the energy to do what I love' },
    { id: 'longevity', icon: '🏆', label: 'Long, active life', desc: 'Staying fit and independent as I age' },
  ]

  const messages: Record<string, { title: string; body: string }> = {
    family: { title: "That's the most powerful motivation of all.", body: "Men who train for their loved ones are 3x more likely to stay consistent. Every rep you do is an investment in time with the people who matter most." },
    health: { title: "You're taking the most important step.", body: "Listening to your doctor and acting on it takes real courage. Exercise is the most evidence-backed tool for long-term health — and you're already ahead of 80% of people." },
    confidence: { title: "You deserve to feel incredible.", body: "There's nothing shallow about wanting to look and feel your best. Self-confidence ripples into every area of life — relationships, career, happiness." },
    energy: { title: "Life is meant to be lived fully.", body: "Low energy is one of the most common complaints after 50 — and one of the most reversible. The right exercise program can transform how you feel within weeks." },
    longevity: { title: "The best investment you can make.", body: "Fitness after 50 isn't about vanity — it's about maintaining your independence, vitality, and quality of life for decades to come. You're thinking exactly right." },
  }

  const handleSelect = (id: string) => {
    setQuizData({ primaryMotivation: id })
    setShowMessage(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 4 of 14</div>
        <h2 className="text-3xl font-bold mb-2">What's driving you?</h2>
        <p className="text-slate-400">Understanding your "why" is the single biggest predictor of long-term success.</p>
      </div>
      <div className="space-y-3">
        {motivations.map(m => (
          <OptionCard key={m.id} selected={quizData.primaryMotivation === m.id} onClick={() => handleSelect(m.id)}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{m.label}</div>
                <div className="text-sm text-slate-400">{m.desc}</div>
              </div>
              {quizData.primaryMotivation === m.id && <Check size={18} className="text-brand-400 shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {showMessage && quizData.primaryMotivation && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <div className="text-brand-400 font-semibold mb-1">{messages[quizData.primaryMotivation]?.title}</div>
            <div className="text-sm text-slate-300">{messages[quizData.primaryMotivation]?.body}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step5({ quizData, setQuizData }: any) {
  const goals = [
    { id: 'athletic', label: 'Athletic', desc: 'Lean, functional, and fit', emoji: '⚡' },
    { id: 'shredded', label: 'Shredded', desc: 'Low body fat, visible definition', emoji: '🔥' },
    { id: 'swole', label: 'Strong & Powerful', desc: 'Big, muscular, commanding', emoji: '💪' },
    { id: 'smaller', label: 'Noticeably Slimmer', desc: 'Significantly reduce size and waistline', emoji: '📉' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 5 of 14</div>
        <h2 className="text-3xl font-bold mb-2">What's your body goal?</h2>
        <p className="text-slate-400">Visualize where you want to be in 3–6 months. Be bold — this is your destination.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {goals.map(g => (
          <OptionCard key={g.id} selected={quizData.bodyGoal === g.id} onClick={() => setQuizData({ bodyGoal: g.id })}>
            <div className="text-center py-3">
              <div className="text-3xl mb-2">{g.emoji}</div>
              <div className="font-semibold mb-1">{g.label}</div>
              <div className="text-xs text-slate-400">{g.desc}</div>
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {quizData.bodyGoal && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-surface-elevated border border-surface-border rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield size={14} className="text-brand-400 shrink-0" />
              <span>Our AI will build your 12-week roadmap toward this exact goal — with safe, joint-friendly progressions for your age group.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step6({ quizData, setQuizData }: any) {
  const [showFeedback, setShowFeedback] = useState(!!quizData.fitnessLevel)
  const levels = [
    { id: 'beginner', label: 'Beginner', desc: 'Never trained or haven\'t in years', icon: '🌱' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Some walking or light physical work', icon: '🚶' },
    { id: 'advanced', label: 'Above Average', desc: 'Train occasionally, 1–3 times per month', icon: '💪' },
    { id: 'professional', label: 'Experienced', desc: 'Regular gym-goer for 6+ months', icon: '🏆' },
  ]

  const handleSelect = (id: string) => {
    setQuizData({ fitnessLevel: id })
    setShowFeedback(true)
  }

  const feedbackMessages: Record<string, { title: string; message: string }> = {
    beginner: { title: "You've got this!", message: "Starting from scratch is the bravest thing you can do. We'll build your foundation safely, step by step. Every champion you've ever admired started exactly where you are today." },
    intermediate: { title: "You have more than you think.", message: "An active lifestyle is a real foundation to build on. We'll channel that energy into structured, progressive training — and the results will surprise you." },
    advanced: { title: "Your consistency will pay off.", message: "You already know how to show up. With a smart, structured program, you'll break through plateaus and reach a whole new level." },
    professional: { title: "Impressive commitment.", message: "Your experience is a massive advantage. We'll build on your solid base with intelligent programming designed to maximize your results at 50+." },
  }

  const feedback = quizData.fitnessLevel ? feedbackMessages[quizData.fitnessLevel] : null

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 6 of 14</div>
        <h2 className="text-3xl font-bold mb-2">Your current fitness level?</h2>
        <p className="text-slate-400">Be honest — there are no wrong answers. This calibrates your starting intensity.</p>
      </div>
      <div className="space-y-3">
        {levels.map(l => (
          <OptionCard key={l.id} selected={quizData.fitnessLevel === l.id} onClick={() => handleSelect(l.id)}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{l.icon}</span>
              <div>
                <div className="font-semibold">{l.label}</div>
                <div className="text-sm text-slate-400">{l.desc}</div>
              </div>
              {quizData.fitnessLevel === l.id && <Check size={18} className="text-brand-400 ml-auto shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {showFeedback && feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <div className="text-brand-400 font-semibold mb-1">{feedback.title}</div>
            <div className="text-sm text-slate-300">{feedback.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step7({ quizData, setQuizData }: any) {
  const [showMessage, setShowMessage] = useState(!!quizData.previousObstacle)
  const obstacles = [
    { id: 'no_time', icon: '⏰', label: "I never had enough time", desc: 'Work, family, life got in the way' },
    { id: 'no_motivation', icon: '😔', label: "I lost motivation", desc: 'Started strong but couldn\'t stay consistent' },
    { id: 'injury', icon: '🩹', label: 'Injuries held me back', desc: 'Pain or physical limitations stopped me' },
    { id: 'no_guidance', icon: '🗺️', label: "I didn't know what to do", desc: 'No clear plan or direction' },
    { id: 'nothing', icon: '✨', label: "Nothing — this is my first try", desc: 'I\'m taking this seriously from day one' },
  ]

  const messages: Record<string, { title: string; body: string }> = {
    no_time: { title: "Time is no longer an obstacle.", body: "Our programs fit into even the busiest schedules — as little as 20 minutes, 3 days a week. We've built this specifically for men who have real lives to manage." },
    no_motivation: { title: "Motivation follows action — not the other way around.", body: "You don't need to feel motivated to start. Our daily check-ins, streak tracking, and AI coaches are designed to keep you going even on the days you'd rather stop." },
    injury: { title: "Your safety is our #1 priority.", body: "Every workout in your plan will be modified for your health conditions. We never push through pain — we work around it intelligently." },
    no_guidance: { title: "That changes today.", body: "You now have a complete AI system — workout plans, nutrition guidance, and three specialist coaches — all built specifically around your answers in this quiz." },
    nothing: { title: "Starting right is starting strong.", body: "The fact that you're being thoughtful and intentional from day one puts you ahead of most. Let's build something that lasts." },
  }

  const handleSelect = (id: string) => {
    setQuizData({ previousObstacle: id })
    setShowMessage(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 7 of 14</div>
        <h2 className="text-3xl font-bold mb-2">What's held you back before?</h2>
        <p className="text-slate-400">Knowing this helps us build a plan that addresses your specific challenge head-on.</p>
      </div>
      <div className="space-y-3">
        {obstacles.map(o => (
          <OptionCard key={o.id} selected={quizData.previousObstacle === o.id} onClick={() => handleSelect(o.id)}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{o.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{o.label}</div>
                <div className="text-sm text-slate-400">{o.desc}</div>
              </div>
              {quizData.previousObstacle === o.id && <Check size={18} className="text-brand-400 shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {showMessage && quizData.previousObstacle && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <div className="text-brand-400 font-semibold mb-1">{messages[quizData.previousObstacle]?.title}</div>
            <div className="text-sm text-slate-300">{messages[quizData.previousObstacle]?.body}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step8({ quizData, setQuizData }: any) {
  const options = [
    { value: 1, label: '1x per week', desc: 'Maintenance & getting started', tag: 'Flexible' },
    { value: 3, label: '3x per week', desc: 'Optimal for most goals', tag: 'Recommended' },
    { value: 5, label: '5x per week', desc: 'Maximum transformation', tag: 'Intensive' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 8 of 14</div>
        <h2 className="text-3xl font-bold mb-2">How often can you train?</h2>
        <p className="text-slate-400">Choose what's <span className="text-white font-medium">realistic</span> for your schedule. Consistency beats intensity every time.</p>
      </div>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={quizData.trainingFrequency === o.value} onClick={() => setQuizData({ trainingFrequency: o.value })}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{o.label}</div>
                <div className="text-sm text-slate-400">{o.desc}</div>
              </div>
              <div className="flex items-center gap-2">
                {quizData.trainingFrequency === o.value && <Check size={16} className="text-brand-400" />}
                <span className="text-xs bg-surface-card border border-surface-border px-2 py-1 rounded-lg text-slate-400">{o.tag}</span>
              </div>
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {quizData.trainingFrequency && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-surface-elevated border border-surface-border rounded-xl">
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Heart size={14} className="text-brand-400 shrink-0 mt-0.5" />
              <span>Whatever frequency you choose — showing up consistently is what creates results. Many of our most successful members train just 3x per week.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step9({ quizData, setQuizData }: any) {
  const formats = [
    { id: 'gym', icon: Dumbbell, label: 'Gym', desc: 'Full equipment access for maximum variety and progression' },
    { id: 'home', icon: Home, label: 'Home Workouts', desc: 'Minimal equipment, maximum results — no commute needed' },
    { id: 'outdoor', icon: TreePine, label: 'Outdoor / Calisthenics', desc: 'Parks, trails, and bodyweight — free and flexible' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 9 of 14</div>
        <h2 className="text-3xl font-bold mb-2">Where do you train?</h2>
        <p className="text-slate-400">Your workouts will be tailored to your available equipment and environment.</p>
      </div>
      <div className="space-y-3">
        {formats.map(f => (
          <OptionCard key={f.id} selected={quizData.trainingFormat === f.id} onClick={() => setQuizData({ trainingFormat: f.id })}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${quizData.trainingFormat === f.id ? 'bg-brand-500' : 'bg-surface-card'}`}>
                <f.icon size={22} className={quizData.trainingFormat === f.id ? 'text-slate-900' : 'text-slate-400'} />
              </div>
              <div>
                <div className="font-semibold">{f.label}</div>
                <div className="text-sm text-slate-400">{f.desc}</div>
              </div>
              {quizData.trainingFormat === f.id && <Check size={18} className="text-brand-400 ml-auto shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

function Step10({ quizData, setQuizData }: any) {
  const durations = [
    { id: '20_30', icon: '⚡', label: '20–30 minutes', desc: 'Short, high-efficiency sessions — perfect for busy days', tag: 'Quick' },
    { id: '30_45', icon: '🎯', label: '30–45 minutes', desc: 'The sweet spot for most goals and schedules', tag: 'Optimal' },
    { id: '45_60', icon: '💪', label: '45–60 minutes', desc: 'More volume, faster progress', tag: 'Dedicated' },
    { id: '60_plus', icon: '🏆', label: '60+ minutes', desc: 'Full sessions for maximum results', tag: 'Committed' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 10 of 14</div>
        <h2 className="text-3xl font-bold mb-2">How long per session?</h2>
        <p className="text-slate-400">We'll design workouts that fit perfectly into the time window you actually have available.</p>
      </div>
      <div className="space-y-3">
        {durations.map(d => (
          <OptionCard key={d.id} selected={quizData.sessionDuration === d.id} onClick={() => setQuizData({ sessionDuration: d.id })}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{d.label}</span>
                  <span className="text-xs bg-surface-card border border-surface-border px-2 py-0.5 rounded-full text-slate-400">{d.tag}</span>
                </div>
                <div className="text-sm text-slate-400">{d.desc}</div>
              </div>
              {quizData.sessionDuration === d.id && <Check size={18} className="text-brand-400 shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {quizData.sessionDuration && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-surface-elevated border border-surface-border rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} className="text-brand-400 shrink-0" />
              <span>Even 20 minutes done consistently beats 60-minute sessions you skip. We'll make every minute count.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step11({ quizData, setQuizData }: any) {
  const [showMessage, setShowMessage] = useState(!!quizData.sleepHours)
  const options = [
    { id: 'under_5', icon: '😴', label: 'Less than 5 hours', desc: 'Significantly sleep-deprived' },
    { id: '5_6', icon: '🌙', label: '5–6 hours', desc: 'Below recommended — affecting recovery' },
    { id: '6_7', icon: '⭐', label: '6–7 hours', desc: 'Getting close to optimal' },
    { id: '7_8', icon: '✅', label: '7–8 hours', desc: 'Ideal range for recovery & performance', popular: true },
    { id: '8_plus', icon: '🏆', label: '8+ hours', desc: 'Excellent sleep foundation' },
  ]

  const messages: Record<string, string> = {
    under_5: "Sleep is the #1 recovery tool. Your program will include specific recovery protocols and we'll help you get more from less sleep.",
    '5_6': "We'll factor this into your training intensity. Even small improvements in sleep can dramatically boost your results.",
    '6_7': "You're close to optimal. Your program will include recovery-focused strategies to maximize what you've got.",
    '7_8': "Perfect — this is the sweet spot. You'll recover well between sessions and see faster results.",
    '8_plus': "Outstanding! Great sleep is a superpower. You're set up for excellent recovery and performance.",
  }

  const handleSelect = (id: string) => {
    setQuizData({ sleepHours: id })
    setShowMessage(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 11 of 14</div>
        <h2 className="text-3xl font-bold mb-2">How much do you sleep?</h2>
        <p className="text-slate-400">Sleep is when your body actually builds muscle and burns fat. It shapes your entire program.</p>
      </div>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.id} selected={quizData.sleepHours === o.id} onClick={() => handleSelect(o.id)}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{o.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{o.label}</span>
                  {(o as any).popular && <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Optimal</span>}
                </div>
                <div className="text-sm text-slate-400">{o.desc}</div>
              </div>
              {quizData.sleepHours === o.id && <Check size={18} className="text-brand-400 shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {showMessage && quizData.sleepHours && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <div className="text-sm text-slate-300">{messages[quizData.sleepHours]}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step12({ quizData, setQuizData }: any) {
  const diets = [
    { id: 'no_restrictions', icon: '🍽️', label: 'No restrictions', desc: "I eat everything — meat, dairy, grains" },
    { id: 'low_carb', icon: '🥩', label: 'Low carb / Keto', desc: 'I limit carbohydrates significantly' },
    { id: 'vegetarian', icon: '🥗', label: 'Vegetarian', desc: 'No meat, but I eat dairy and eggs' },
    { id: 'vegan', icon: '🌱', label: 'Vegan', desc: 'No animal products at all' },
    { id: 'intermittent', icon: '⏰', label: 'Intermittent fasting', desc: 'I eat in a restricted time window' },
    { id: 'mediterranean', icon: '🫒', label: 'Mediterranean', desc: 'Fish, olive oil, vegetables, whole grains' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 12 of 14</div>
        <h2 className="text-3xl font-bold mb-2">Your eating style?</h2>
        <p className="text-slate-400">Your nutrition plan will be built around what you already eat — no extreme diets required.</p>
      </div>
      <div className="space-y-3">
        {diets.map(d => (
          <OptionCard key={d.id} selected={quizData.dietType === d.id} onClick={() => setQuizData({ dietType: d.id })}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{d.label}</div>
                <div className="text-sm text-slate-400">{d.desc}</div>
              </div>
              {quizData.dietType === d.id && <Check size={18} className="text-brand-400 shrink-0" />}
            </div>
          </OptionCard>
        ))}
      </div>
      <AnimatePresence>
        {quizData.dietType && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-surface-elevated border border-surface-border rounded-xl">
            <div className="text-xs text-slate-400">Your meal plan will be fully compatible with your eating style — practical recipes you'll actually want to eat.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step13({ quizData, setQuizData }: any) {
  const conditions = ['Back pain / disc issues', 'Knee problems', 'Heart condition', 'Hypertension', 'Diabetes', 'Shoulder injury', 'Hip replacement', 'Joint arthritis']
  const selected: string[] = quizData.medicalConditions || []

  const toggle = (c: string) => {
    if (c === 'None') {
      setQuizData({ medicalConditions: ['None'] })
      return
    }
    const filtered = selected.filter(s => s !== 'None')
    const next = filtered.includes(c) ? filtered.filter(s => s !== c) : [...filtered, c]
    setQuizData({ medicalConditions: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Step 13 of 14</div>
        <h2 className="text-3xl font-bold mb-2">Any health considerations?</h2>
        <p className="text-slate-400">This is the most important safety step. Your AI trainer will modify every exercise to keep you safe and effective.</p>
      </div>
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2">
        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300">Always consult your doctor before starting a new exercise program, especially with existing health conditions. Your safety comes first.</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[...conditions, 'None'].map(c => (
          <OptionCard key={c} selected={selected.includes(c)} onClick={() => toggle(c)}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selected.includes(c) ? 'border-brand-500 bg-brand-500' : 'border-slate-600'}`}>
                {selected.includes(c) && <Check size={12} className="text-slate-900" />}
              </div>
              <span className="text-sm font-medium">{c}</span>
            </div>
          </OptionCard>
        ))}
      </div>
      <textarea
        value={quizData.medicalNotes || ''}
        onChange={e => setQuizData({ medicalNotes: e.target.value })}
        placeholder="Any additional notes for your trainer... (optional)"
        className="input-field h-20 resize-none text-sm"
      />
    </div>
  )
}

function Step14({ quizData, setQuizData, onSkip }: any) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setQuizData({ photoUrl: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  const goalLabels: Record<string, string> = {
    build_muscle: 'Build Muscle', lose_weight: 'Lose Weight', recomposition: 'Body Recomposition', improve_fitness: 'Improve Fitness'
  }
  const levelLabels: Record<string, string> = {
    beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Above Average', professional: 'Experienced'
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Final Step — 14 of 14</div>
        <h2 className="text-3xl font-bold mb-2">You're almost there!</h2>
        <p className="text-slate-400">Optionally upload a progress photo, then let our AI build your personalized plan.</p>
      </div>

      <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-brand-400 mb-2">Your Profile Summary</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {quizData.age && <div className="text-slate-300"><span className="text-slate-500">Age:</span> {quizData.age}</div>}
          {quizData.trainingGoal && <div className="text-slate-300"><span className="text-slate-500">Goal:</span> {goalLabels[quizData.trainingGoal] || quizData.trainingGoal}</div>}
          {quizData.fitnessLevel && <div className="text-slate-300"><span className="text-slate-500">Level:</span> {levelLabels[quizData.fitnessLevel] || quizData.fitnessLevel}</div>}
          {quizData.trainingFrequency && <div className="text-slate-300"><span className="text-slate-500">Frequency:</span> {quizData.trainingFrequency}x / week</div>}
        </div>
        <div className="text-xs text-slate-400 pt-1 border-t border-surface-border">
          Our AI is ready to generate your fully personalized 12-week program based on everything you've shared.
        </div>
      </div>

      <div className="border-2 border-dashed border-surface-border rounded-2xl p-8 text-center hover:border-brand-500/40 transition-colors">
        {quizData.photoUrl ? (
          <div>
            <img src={quizData.photoUrl} alt="Progress" className="w-32 h-32 rounded-xl object-cover mx-auto mb-4" />
            <p className="text-brand-400 text-sm font-medium">Photo uploaded ✓</p>
          </div>
        ) : (
          <>
            <Camera size={40} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-1">Progress Photo (Optional)</p>
            <p className="text-slate-400 mb-4 text-sm">Upload a front-facing photo so your AI trainer can track your visual progress over time</p>
            <label className="btn-secondary cursor-pointer text-sm px-4 py-2 inline-block">
              Choose Photo
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </>
        )}
      </div>
      <button onClick={onSkip} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors py-2">
        <SkipForward size={16} /> Skip photo, build my plan now
      </button>
    </div>
  )
}

export default function QuizPage() {
  const navigate = useNavigate()
  const { quizData, setQuizData, currentStep, setCurrentStep, sessionKey } = useQuiz()
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)

  const steps = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9, Step10, Step11, Step12, Step13, Step14]
  const StepComponent = steps[currentStep]

  const canProceed = () => {
    if (currentStep === 0) return quizData.age && quizData.age >= 30 && quizData.gender
    if (currentStep === 1) return quizData.heightCm && quizData.weightKg
    if (currentStep === 2) return quizData.trainingGoal
    if (currentStep === 3) return quizData.primaryMotivation
    if (currentStep === 4) return quizData.bodyGoal
    if (currentStep === 5) return quizData.fitnessLevel
    if (currentStep === 6) return quizData.previousObstacle
    if (currentStep === 7) return quizData.trainingFrequency
    if (currentStep === 8) return quizData.trainingFormat
    if (currentStep === 9) return quizData.sessionDuration
    if (currentStep === 10) return quizData.sleepHours
    if (currentStep === 11) return quizData.dietType
    return true
  }

  const next = async () => {
    if (!canProceed()) return
    if (currentStep === TOTAL_STEPS - 1) {
      await finish()
      return
    }
    setDirection(1)
    setCurrentStep(currentStep + 1)
  }

  const back = () => {
    if (currentStep === 0) { navigate('/'); return }
    setDirection(-1)
    setCurrentStep(currentStep - 1)
  }

  const finish = async () => {
    setLoading(true)
    try {
      await supabase.from('temp_quiz_data').upsert({
        session_key: sessionKey,
        data: quizData,
      })
    } catch (e) {
      console.warn('Could not save quiz data:', e)
    }
    localStorage.setItem('quiz_session_key', sessionKey)
    localStorage.setItem('quiz_data', JSON.stringify(quizData))
    navigate('/analyzing')
  }

  const handleSkip = () => {
    finish()
  }

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-[#0a0a15] flex flex-col">
      <div className="w-full h-1 bg-surface-border">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-cyan-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex items-center px-6 py-4 border-b border-surface-border">
        <button onClick={back} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-slate-400" />
        </button>
        <div className="mx-auto flex items-center gap-2">
          <Dumbbell size={18} className="text-brand-400" />
          <span className="font-bold gradient-text">FitCoach AI</span>
        </div>
        <div className="text-xs text-slate-500 w-10 text-right">{currentStep + 1}/{TOTAL_STEPS}</div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants as any}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepComponent quizData={quizData} setQuizData={setQuizData} onSkip={handleSkip} />
            </motion.div>
          </AnimatePresence>

          {currentStep < TOTAL_STEPS - 1 && (
            <motion.button
              key={`btn-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={next}
              disabled={!canProceed() || loading}
              className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${canProceed() ? 'btn-primary' : 'bg-surface-elevated text-slate-600 cursor-not-allowed'}`}
            >
              Continue <ChevronRight size={20} />
            </motion.button>
          )}

          {currentStep === TOTAL_STEPS - 1 && !loading && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={next}
              className="btn-primary w-full mt-8 py-4 text-lg flex items-center justify-center gap-2"
            >
              Build My Plan <ChevronRight size={20} />
            </motion.button>
          )}

          {loading && (
            <div className="flex items-center justify-center mt-8 gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span className="text-slate-400 text-sm">Saving your profile...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
