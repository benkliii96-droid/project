import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Dumbbell, Apple, Brain } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getAgentResponseAI, agentPersonalities } from '../lib/openai'
import DashboardLayout from '../components/DashboardLayout'

type AgentType = 'trainer' | 'nutritionist' | 'psychologist'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent_type: AgentType
}

const agents: { id: AgentType; label: string; icon: typeof Dumbbell; color: string; accentClass: string }[] = [
  { id: 'trainer', label: 'Trainer', icon: Dumbbell, color: '#00c9a0', accentClass: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
  { id: 'nutritionist', label: 'Nutritionist', icon: Apple, color: '#22c55e', accentClass: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { id: 'psychologist', label: 'Psychologist', icon: Brain, color: '#38bdf8', accentClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
]

const quickReplies: Record<AgentType, string[]> = {
  trainer: ['How many sets should I do?', 'Can I modify an exercise?', 'How do I progress?', 'When should I increase weight?'],
  nutritionist: ['What should I eat before workout?', 'How much protein do I need?', 'Best supplements for 50+?', 'Can I regenerate my meal plan?'],
  psychologist: ["I'm feeling unmotivated", 'How do I stay consistent?', 'I missed a workout', 'How do I track progress?'],
}

export default function ChatPage() {
  const { user } = useAuth()
  const [activeAgent, setActiveAgent] = useState<AgentType>('trainer')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')

  useEffect(() => {
    loadMessages()
  }, [user, activeAgent])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const loadMessages = async () => {
    setLoading(true)
    try {
      if (user) {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('agent_type', activeAgent)
          .order('created_at', { ascending: true })
          .limit(50)

        if (data && data.length > 0) {
          setMessages(data as Message[])
        } else {
          const intro = agentPersonalities[activeAgent]?.intro || "Hello! How can I help you today?"
          const welcomeMsg: Message = {
            id: `welcome-${activeAgent}`,
            role: 'assistant',
            content: intro,
            agent_type: activeAgent,
          }
          setMessages([welcomeMsg])
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return
    setInput('')

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      agent_type: activeAgent,
    }

    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    if (user) {
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        agent_type: activeAgent,
        role: 'user',
        content: text,
      })
    }

    try {
      // Build conversation history for context (last 20 messages)
      const history = [...messages, userMsg]
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }))
      const response = await getAgentResponseAI(activeAgent, history, quizData)
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        agent_type: activeAgent,
      }
      setMessages(prev => [...prev, assistantMsg])

      if (user) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          agent_type: activeAgent,
          role: 'assistant',
          content: response,
        })
      }
    } finally {
      setTyping(false)
    }
  }

  const currentAgent = agents.find(a => a.id === activeAgent)!

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-4">
          AI Coaches
        </motion.h1>

        <div className="flex gap-2 mb-4">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${activeAgent === agent.id ? agent.accentClass + ' border' : 'border-surface-border text-slate-400 hover:border-slate-600'}`}
            >
              <agent.icon size={15} />
              <span className="hidden sm:block">{agent.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: `${currentAgent.color}20`, border: `1px solid ${currentAgent.color}30` }}>
                      <currentAgent.icon size={14} style={{ color: currentAgent.color }} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-slate-900 rounded-tr-sm'
                        : 'bg-surface-elevated border border-surface-border text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${currentAgent.color}20` }}>
                      <currentAgent.icon size={14} style={{ color: currentAgent.color }} />
                    </div>
                    <div className="bg-surface-elevated border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500"
                            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickReplies[activeAgent].map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-lg border border-surface-border text-slate-400 hover:text-white hover:border-brand-500/40 transition-all duration-150"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder={`Ask ${agentPersonalities[activeAgent]?.name || 'your coach'}...`}
              className="input-field flex-1"
              disabled={typing}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${input.trim() && !typing ? 'bg-brand-500 text-slate-900 hover:opacity-90' : 'bg-surface-elevated text-slate-600'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </DashboardLayout>
  )
}
