import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { QuizData } from '../types'

interface QuizContextType {
  quizData: Partial<QuizData>
  setQuizData: (data: Partial<QuizData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  sessionKey: string
}

const QuizContext = createContext<QuizContextType | null>(null)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizData, setQuizDataState] = useState<Partial<QuizData>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionKey] = useState(() => `quiz_${Date.now()}_${Math.random().toString(36).slice(2)}`)

  const setQuizData = (data: Partial<QuizData>) => {
    setQuizDataState(prev => ({ ...prev, ...data }))
  }

  return (
    <QuizContext.Provider value={{ quizData, setQuizData, currentStep, setCurrentStep, sessionKey }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider')
  return ctx
}
