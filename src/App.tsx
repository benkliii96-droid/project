import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { QuizProvider } from './contexts/QuizContext'
import LandingPage from './pages/LandingPage'
import QuizPage from './pages/QuizPage'
import AnalyzingPage from './pages/AnalyzingPage'
import RegisterPage from './pages/RegisterPage'
import SubscriptionPage from './pages/SubscriptionPage'
import DashboardPage from './pages/DashboardPage'
import WorkoutSessionPage from './pages/WorkoutSessionPage'
import ProgressPage from './pages/ProgressPage'
import ChatPage from './pages/ChatPage'
import MealPlanPage from './pages/MealPlanPage'
import ProfilePage from './pages/ProfilePage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import RefundPage from './pages/RefundPage'

function ProtectedRoute({ children, requireSub = true }: { children: React.ReactNode; requireSub?: boolean }) {
  const { user, loading, hasSubscription } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a15] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/register" replace />
  if (requireSub && !hasSubscription) return <Navigate to="/subscription" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/quiz" element={<QuizProvider><QuizPage /></QuizProvider>} />
      <Route path="/analyzing" element={<AnalyzingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/subscription" element={
        <ProtectedRoute requireSub={false}><SubscriptionPage /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/dashboard/workout/:dayId" element={
        <ProtectedRoute><WorkoutSessionPage /></ProtectedRoute>
      } />
      <Route path="/dashboard/progress" element={
        <ProtectedRoute><ProgressPage /></ProtectedRoute>
      } />
      <Route path="/dashboard/chat" element={
        <ProtectedRoute><ChatPage /></ProtectedRoute>
      } />
      <Route path="/dashboard/nutrition" element={
        <ProtectedRoute><MealPlanPage /></ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/payment/success" element={
        <ProtectedRoute requireSub={false}><PaymentSuccessPage /></ProtectedRoute>
      } />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
