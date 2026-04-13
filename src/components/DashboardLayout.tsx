import { NavLink, useNavigate } from 'react-router-dom'
import { Dumbbell, ChartBar as BarChart2, MessageCircle, Apple, Hop as Home, LogOut, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
  { to: '/dashboard/nutrition', icon: Apple, label: 'Nutrition', end: false },
  { to: '/dashboard/progress', icon: BarChart2, label: 'Progress', end: false },
  { to: '/dashboard/chat', icon: MessageCircle, label: 'AI Coaches', end: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a15] flex">
      <aside className="hidden md:flex flex-col w-60 bg-surface-card border-r border-surface-border fixed h-full z-40">
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Dumbbell size={16} className="text-slate-900" />
            </div>
            <span className="font-bold gradient-text">FitCoach AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-surface-elevated'}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 mb-2 py-2 rounded-xl transition-all duration-150 ${isActive ? 'bg-brand-500/10 border border-brand-500/20' : 'hover:bg-surface-elevated'}`
            }
          >
            {(() => {
              const av = localStorage.getItem('profile_avatar')
              return av
                ? <img src={av} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                : <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
            })()}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.user_metadata?.full_name || 'User'}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
            <User size={14} className="text-slate-500 shrink-0" />
          </NavLink>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm w-full px-2 py-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface-card/80 backdrop-blur-md border-b border-surface-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Dumbbell size={14} className="text-slate-900" />
            </div>
            <span className="font-bold gradient-text text-sm">FitCoach AI</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-400 hover:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="bg-surface-card border-t border-surface-border p-4 space-y-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-brand-500/10 text-brand-400' : 'text-slate-400'}`}
              >
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
            <NavLink to="/dashboard/profile" end={false} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-brand-500/10 text-brand-400' : 'text-slate-400'}`}
            >
              <User size={18} /> My Profile
            </NavLink>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-slate-500 text-sm w-full">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
