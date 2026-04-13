import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfToday } from 'date-fns'
import { RefreshCw, Flame, Beef, Wheat, Droplets, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateMealPlan } from '../lib/mockData'
import DashboardLayout from '../components/DashboardLayout'
import type { MealPlan, Meal } from '../types'

function MealCard({ meal, onRegenerate }: { meal: Meal; onRegenerate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const typeColors: Record<string, string> = {
    breakfast: 'text-yellow-400 bg-yellow-400/10',
    lunch: 'text-brand-400 bg-brand-500/10',
    dinner: 'text-blue-400 bg-blue-400/10',
    snack: 'text-orange-400 bg-orange-400/10',
  }
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[meal.type] || 'text-slate-400 bg-slate-700'}`}>{meal.type}</span>
          <span className="text-xs text-slate-400">{meal.prepTime}</span>
        </div>
        <button onClick={onRegenerate} className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
          <RefreshCw size={14} />
        </button>
      </div>

      <h3 className="font-bold text-base mb-3">{meal.name}</h3>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Kcal', value: meal.calories, icon: Flame, color: 'text-orange-400' },
          { label: 'Protein', value: `${meal.protein}g`, icon: Beef, color: 'text-brand-400' },
          { label: 'Carbs', value: `${meal.carbs}g`, icon: Wheat, color: 'text-yellow-400' },
          { label: 'Fat', value: `${meal.fat}g`, icon: Droplets, color: 'text-blue-400' },
        ].map(m => (
          <div key={m.label} className="text-center p-2 bg-surface-elevated rounded-lg">
            <m.icon size={12} className={`${m.color} mx-auto mb-1`} />
            <div className="text-sm font-bold">{m.value}</div>
            <div className="text-xs text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide' : 'Show'} recipe & ingredients
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-surface-border space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-2">Ingredients</div>
                <ul className="space-y-1">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-2">Recipe</div>
                <p className="text-sm text-slate-300 leading-relaxed">{meal.recipe}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MealPlanPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(startOfToday())
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}')

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i))

  useEffect(() => {
    loadMealPlan()
  }, [user, selectedDate])

  const loadMealPlan = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      if (user) {
        const { data } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_date', dateStr)
          .maybeSingle()

        if (data) {
          setMealPlan({
            date: dateStr,
            totalCalories: data.total_calories,
            totalProtein: data.total_protein,
            totalCarbs: data.total_carbs,
            totalFat: data.total_fat,
            meals: data.meals as Meal[],
          })
          return
        }
      }

      const dayIndex = weekDays.findIndex(d => format(d, 'yyyy-MM-dd') === dateStr)
      const generated = generateMealPlan(quizData, dateStr, dayIndex >= 0 ? dayIndex : 0)
      setMealPlan(generated)

      if (user) {
        await supabase.from('meal_plans').upsert({
          user_id: user.id,
          plan_date: dateStr,
          meals: generated.meals,
          total_calories: generated.totalCalories,
          total_protein: generated.totalProtein,
          total_carbs: generated.totalCarbs,
          total_fat: generated.totalFat,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const regenerateMeal = (mealIndex: number) => {
    if (!mealPlan) return
    const dateIndex = weekDays.findIndex(d => format(d, 'yyyy-MM-dd') === mealPlan.date)
    const newPlan = generateMealPlan(quizData, mealPlan.date, (dateIndex + mealIndex + 3) % 7)
    const newMeals = [...mealPlan.meals]
    newMeals[mealIndex] = newPlan.meals[mealIndex] || newPlan.meals[0]
    const updated: MealPlan = {
      ...mealPlan,
      meals: newMeals,
      totalCalories: newMeals.reduce((s, m) => s + m.calories, 0),
      totalProtein: newMeals.reduce((s, m) => s + m.protein, 0),
      totalCarbs: newMeals.reduce((s, m) => s + m.carbs, 0),
      totalFat: newMeals.reduce((s, m) => s + m.fat, 0),
    }
    setMealPlan(updated)
    if (user) {
      supabase.from('meal_plans').upsert({
        user_id: user.id,
        plan_date: mealPlan.date,
        meals: updated.meals,
        total_calories: updated.totalCalories,
        total_protein: updated.totalProtein,
        total_carbs: updated.totalCarbs,
        total_fat: updated.totalFat,
      })
    }
  }

  const regenerateDay = async () => {
    if (!user || !mealPlan) return
    setLoading(true)
    await supabase.from('meal_plans').delete().eq('user_id', user.id).eq('plan_date', mealPlan.date)
    await loadMealPlan()
  }

  const allIngredients = mealPlan?.meals.flatMap(m => m.ingredients) || []

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">
            Nutrition Plan
          </motion.h1>
          {mealPlan && (
            <button onClick={regenerateDay} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              <RefreshCw size={14} /> Regenerate Day
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDays.map((day, i) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            const isToday = format(day, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd')
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center min-w-[52px] px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                  isSelected ? 'bg-brand-500/10 border-brand-500/40 text-brand-400' : 'border-surface-border text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                <span className="text-base font-bold">{format(day, 'd')}</span>
                {isToday && <span className="w-1 h-1 rounded-full bg-brand-400 mt-1" />}
              </button>
            )
          })}
        </div>

        {mealPlan && !loading && (
          <>
            <div className="card">
              <div className="section-label mb-3">Daily Nutrition</div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Calories', value: mealPlan.totalCalories, max: 2500, color: 'bg-orange-400' },
                  { label: 'Protein', value: mealPlan.totalProtein, max: 180, unit: 'g', color: 'bg-brand-500' },
                  { label: 'Carbs', value: mealPlan.totalCarbs, max: 280, unit: 'g', color: 'bg-yellow-400' },
                  { label: 'Fat', value: mealPlan.totalFat, max: 90, unit: 'g', color: 'bg-blue-400' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                    <div className="text-lg font-bold mb-1">{m.value}{m.unit || ''}</div>
                    <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} rounded-full`} style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {mealPlan.meals.map((meal, i) => (
                <motion.div key={`${meal.name}-${i}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <MealCard meal={meal} onRegenerate={() => regenerateMeal(i)} />
                </motion.div>
              ))}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={18} className="text-brand-400" />
                <span className="font-bold">Today's Shopping List</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...new Set(allIngredients)].map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                    {ing}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-36 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
