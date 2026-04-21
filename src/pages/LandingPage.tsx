import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Brain, Utensils, TrendingUp, CircleCheck as CheckCircle, ArrowRight, Star, Zap, Shield, Target } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a15] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a15]/80 backdrop-blur-md border-b border-surface-border">
        <div className="flex items-center justify-between h-16 max-w-6xl px-6 mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400">
              <Dumbbell size={16} className="text-slate-900" />
            </div>
            <span className="text-lg font-bold gradient-text">FitCoach AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/register')} className="px-4 py-2 text-sm btn-secondary">
              Sign In
            </button>
            <button onClick={() => navigate('/quiz')} className="px-4 py-2 text-sm btn-primary">
              Start Free
            </button>
          </div>
        </div>
      </header>

      <section className="relative flex items-center justify-center min-h-screen pt-16 overflow-hidden bg-mesh">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 blur-3xl" />
          <div className="absolute rounded-full bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl px-6 mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-brand-500/10 border-brand-500/20">
              <Zap size={14} className="text-brand-400" />
              <span className="text-sm font-medium text-brand-400">AI-Powered Fitness for 45+</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="mb-6 text-5xl font-black leading-tight md:text-7xl">
              Support Your Body.
              <span className="block gradient-text">Strengthen Your Life</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed md:text-2xl text-slate-400">
              Your personal AI fitness trainer, nutritionist, and sports psychologist — all in one app. Built specifically for over 45.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col justify-center gap-4 mb-12 sm:flex-row">
              <button
                onClick={() => navigate('/quiz')}
                className="flex items-center justify-center gap-2 px-8 py-4 text-lg btn-primary"
              >
                Start Free Assessment <ArrowRight size={20} />
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8">
              {[
                { value: '12K+', label: 'Active Members' },
                { value: '94%', label: 'Success Rate' },
                { value: '45+', label: 'Age Group' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black gradient-text">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16 text-center">
            <motion.div variants={fadeUp} className="mb-3 section-label">Features</motion.div>
            <motion.h2 variants={fadeUp} className="mb-4 text-4xl font-bold">Everything You Need to Succeed</motion.h2>
            <motion.p variants={fadeUp} className="max-w-xl mx-auto text-lg text-slate-400">Science-backed training methods tailored for mature athletes.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, title: 'AI Personal Trainer', desc: 'Intelligent workouts that adapt to your progress, fitness level, and recovery capacity.' },
              { icon: Utensils, title: 'Expert Nutrition', desc: 'Anti-inflammatory meal plans with diverse, delicious recipes — not just chicken and rice.' },
              { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visual progress logs, workout streaks, and milestone celebrations to keep you going.' },
              { icon: Shield, title: 'Joint-Safe Training', desc: 'Every exercise is chosen with the 45+ body in mind. No dangerous movements, ever.' },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="transition-all duration-300 card hover:border-brand-500/40">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-brand-500/10">
                  <feature.icon size={24} className="text-brand-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 bg-surface-card border-y border-surface-border">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16 text-center">
            <motion.div variants={fadeUp} className="mb-3 section-label">Testimonials</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold">Real People, Real Results</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Robert M., 58', result: 'Lost 18kg in 4 months', quote: 'I never thought I could get back in shape at 58. FitCoach AI gave me a realistic plan I could actually stick to. My doctor is amazed.', img: 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?w=100&h=100&fit=crop&crop=face' },
              { name: 'David K., 62', result: 'Built 8kg of muscle', quote: 'The AI trainer understands my limitations — bad knee, tight schedule. Every workout feels designed specifically for me. Finally seeing results!', img: 'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?w=100&h=100&fit=crop&crop=face' },
              { name: 'Michael T., 54', result: 'Off blood pressure meds', quote: 'Six months ago I was pre-diabetic. Now my blood pressure is normal and I have more energy than I did at 40. This app changed my life.', img: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?w=100&h=100&fit=crop&crop=face' },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="card">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-slate-300">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="object-cover w-12 h-12 rounded-full" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-brand-400">{t.result}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16 text-center">
            <motion.div variants={fadeUp} className="mb-3 section-label">How It Works</motion.div>
            <motion.h2 variants={fadeUp} className="mb-4 text-4xl font-bold">3 Steps to Your Best Shape</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-6">
            {[
              { step: '01', title: 'Take the Assessment', desc: 'Answer 14 questions about your goals, fitness level, health, and lifestyle. Takes 15–20 minutes.' },
              { step: '02', title: 'AI Builds Your Plan', desc: 'Our AI analyzes your profile and creates a fully personalized workout and nutrition program.' },
              { step: '03', title: 'Train & Transform', desc: 'Follow your plan, track progress, and chat with your AI coaches anytime you need guidance.' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-start gap-6 p-6 card">
                <div className="text-5xl font-black gradient-text shrink-0">{item.step}</div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 bg-gradient-to-b from-brand-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="mb-6 text-4xl font-black md:text-5xl">
              Your Best Years
              <span className="block gradient-text">Are Ahead of You</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-8 text-lg text-slate-400">
              Join 12,000+ people who refused to let age define their fitness. Start your free assessment today.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col justify-center gap-4 sm:flex-row">
              <button onClick={() => navigate('/quiz')} className="flex items-center justify-center gap-2 px-10 py-4 text-lg btn-primary">
                Start Free Assessment <ArrowRight size={20} />
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-400" /> No credit card needed</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-400" /> Cancel anytime</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-400" /> 7-day free trial</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="px-6 py-10 border-t border-surface-border">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-gradient-to-br from-brand-500 to-cyan-400">
                <Dumbbell size={14} className="text-slate-900" />
              </div>
              <span className="font-bold gradient-text">FitCoach AI</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Target size={12} /> Built for those who refuse to slow down
            </div>
            <div className="text-sm text-slate-600">© 2026 FitCoach AI</div>
          </div>

          <div className="pt-4 space-y-3 border-t border-surface-border/50">
            <p className="text-xs leading-relaxed text-slate-600">
              This service does not provide medical advice. For health concerns, consult a licensed professional.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link to="/terms" className="text-xs transition-colors text-slate-600 hover:text-slate-400">Terms of Service</Link>
              <Link to="/privacy" className="text-xs transition-colors text-slate-600 hover:text-slate-400">Privacy Policy</Link>
              <Link to="/refund" className="text-xs transition-colors text-slate-600 hover:text-slate-400">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
