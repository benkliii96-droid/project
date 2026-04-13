import { useNavigate } from 'react-router-dom'
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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Dumbbell size={16} className="text-slate-900" />
            </div>
            <span className="font-bold text-lg gradient-text">FitCoach AI</span>
          </div>
          <button onClick={() => navigate('/quiz')} className="btn-primary text-sm px-4 py-2">
            Start Free
          </button>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-16 bg-mesh overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
              <Zap size={14} className="text-brand-400" />
              <span className="text-sm text-brand-400 font-medium">AI-Powered Fitness for Men 50+</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Transform Your Body
              <span className="block gradient-text">at 50+</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your personal AI fitness trainer, nutritionist, and sports psychologist — all in one app. Built specifically for men over 50.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/quiz')}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                Start Free Assessment <ArrowRight size={20} />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                See How It Works
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8">
              {[
                { value: '12K+', label: 'Active Members' },
                { value: '94%', label: 'Success Rate' },
                { value: '50+', label: 'Age Group' },
                { value: '#1', label: 'Rated App' },
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

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label mb-3">Features</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">Everything You Need to Succeed</motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">Science-backed training methods tailored for mature athletes.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'AI Personal Trainer', desc: 'Intelligent workouts that adapt to your progress, fitness level, and recovery capacity.' },
              { icon: Utensils, title: 'Expert Nutrition', desc: 'Anti-inflammatory meal plans with diverse, delicious recipes — not just chicken and rice.' },
              { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visual progress logs, workout streaks, and milestone celebrations to keep you going.' },
              { icon: Shield, title: 'Joint-Safe Training', desc: 'Every exercise is chosen with the 50+ body in mind. No dangerous movements, ever.' },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="card hover:border-brand-500/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-surface-card border-y border-surface-border">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label mb-3">Testimonials</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold">Real Men, Real Results</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Robert M., 58', result: 'Lost 18kg in 4 months', quote: 'I never thought I could get back in shape at 58. FitCoach AI gave me a realistic plan I could actually stick to. My doctor is amazed.', img: 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?w=100&h=100&fit=crop&crop=face' },
              { name: 'David K., 62', result: 'Built 8kg of muscle', quote: 'The AI trainer understands my limitations — bad knee, tight schedule. Every workout feels designed specifically for me. Finally seeing results!', img: 'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?w=100&h=100&fit=crop&crop=face' },
              { name: 'Michael T., 54', result: 'Off blood pressure meds', quote: 'Six months ago I was pre-diabetic. Now my blood pressure is normal and I have more energy than I did at 40. This app changed my life.', img: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?w=100&h=100&fit=crop&crop=face' },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="card">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-brand-400 text-xs">{t.result}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label mb-3">How It Works</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">3 Steps to Your Best Shape</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-6">
            {[
              { step: '01', title: 'Take the Assessment', desc: 'Answer 9 questions about your goals, fitness level, and health. Takes less than 5 minutes.' },
              { step: '02', title: 'AI Builds Your Plan', desc: 'Our AI analyzes your profile and creates a fully personalized workout and nutrition program.' },
              { step: '03', title: 'Train & Transform', desc: 'Follow your plan, track progress, and chat with your AI coaches anytime you need guidance.' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex gap-6 items-start p-6 card">
                <div className="text-5xl font-black gradient-text shrink-0">{item.step}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-brand-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-6">
              Your Best Years
              <span className="block gradient-text">Are Ahead of You</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-8">
              Join 12,000+ men who refused to let age define their fitness. Start your free assessment today.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/quiz')} className="btn-primary text-lg px-10 py-4 flex items-center justify-center gap-2">
                Start Free Assessment <ArrowRight size={20} />
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-400" /> No credit card needed</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-400" /> Cancel anytime</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-400" /> 7-day free trial</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-surface-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Dumbbell size={14} className="text-slate-900" />
            </div>
            <span className="font-bold gradient-text">FitCoach AI</span>
          </div>
          <div className="text-slate-600 text-sm flex items-center gap-1">
            <Target size={12} /> Built for men who refuse to slow down
          </div>
          <div className="text-slate-600 text-sm">© 2024 FitCoach AI</div>
        </div>
      </footer>
    </div>
  )
}
