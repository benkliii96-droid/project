import type { QuizData, WorkoutPlan, MealPlan } from '../types'

const MODEL = 'gpt-4o-mini'

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildProfile(q: Partial<QuizData>): string {
  const goalMap: Record<string, string> = {
    build_muscle: 'Build Muscle & Strength',
    lose_weight: 'Lose Weight & Burn Fat',
    recomposition: 'Body Recomposition',
    improve_fitness: 'Improve Overall Fitness',
  }
  const levelMap: Record<string, string> = {
    beginner: 'Beginner (never trained or took years off)',
    intermediate: 'Intermediate (some walking / light activity)',
    advanced: 'Above Average (trains 1-3x/month)',
    professional: 'Experienced (regular gym-goer 6+ months)',
  }
  const sleepMap: Record<string, string> = {
    under_5: '<5 hours (sleep-deprived)',
    '5_6': '5-6 hours (below optimal)',
    '6_7': '6-7 hours (near optimal)',
    '7_8': '7-8 hours (ideal)',
    '8_plus': '8+ hours (excellent)',
  }
  const dietMap: Record<string, string> = {
    no_restrictions: 'No dietary restrictions (omnivore)',
    low_carb: 'Low-carb / Ketogenic',
    vegetarian: 'Vegetarian (no meat, dairy & eggs ok)',
    vegan: 'Vegan (no animal products)',
    intermittent: 'Intermittent Fasting',
    mediterranean: 'Mediterranean diet',
  }
  const durationMap: Record<string, string> = {
    '20_30': '20-30 minutes',
    '30_45': '30-45 minutes',
    '45_60': '45-60 minutes',
    '60_plus': '60+ minutes',
  }
  const motivationMap: Record<string, string> = {
    family: 'Being there for family & loved ones',
    health: "Doctor's recommendation / health concern",
    confidence: 'Personal confidence & self-image',
    energy: 'Energy & vitality',
    longevity: 'Long, active independent life',
  }
  const obstacleMap: Record<string, string> = {
    no_time: 'Lack of time',
    no_motivation: 'Lost motivation / inconsistency',
    injury: 'Previous injuries',
    no_guidance: 'No clear plan or direction',
    nothing: 'First time starting (no prior obstacles)',
  }

  const bmi =
    q.heightCm && q.weightKg
      ? (q.weightKg / Math.pow(q.heightCm / 100, 2)).toFixed(1)
      : 'N/A'

  return `
=== USER FITNESS PROFILE ===
• Age: ${q.age || 'N/A'} years old
• Gender: ${q.gender || 'N/A'}
• Height: ${q.heightCm || 'N/A'} cm | Weight: ${q.weightKg || 'N/A'} kg | BMI: ${bmi}
• Primary Goal: ${goalMap[q.trainingGoal || ''] || q.trainingGoal || 'N/A'}
• Body Goal: ${q.bodyGoal || 'N/A'}
• Fitness Level: ${levelMap[q.fitnessLevel || ''] || 'N/A'}
• Training Frequency: ${q.trainingFrequency || 3}x per week
• Training Environment: ${q.trainingFormat || 'gym'}
• Session Duration: ${durationMap[q.sessionDuration || ''] || '30-45 minutes'}
• Sleep per Night: ${sleepMap[q.sleepHours || ''] || 'N/A'}
• Diet Style: ${dietMap[q.dietType || ''] || 'No restrictions'}
• Medical Conditions: ${q.medicalConditions?.filter(c => c !== 'None').join(', ') || 'None reported'}
• Medical Notes: ${q.medicalNotes || 'None'}
• Primary Motivation: ${motivationMap[q.primaryMotivation || ''] || 'N/A'}
• Previous Obstacle: ${obstacleMap[q.previousObstacle || ''] || 'N/A'}
`.trim()
}

async function callGPT(
  messages: { role: string; content: unknown }[],
  maxTokens = 2500,
  model = MODEL
): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(`OpenAI ${res.status}: ${err.error}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  const clean = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(clean)
}

// ─── Workout Plan ────────────────────────────────────────────────────────────

export async function generateWorkoutPlanAI(quizData: Partial<QuizData>): Promise<WorkoutPlan> {
  const profile = buildProfile(quizData)
  const freq = quizData.trainingFrequency || 3
  const format = quizData.trainingFormat || 'gym'

  const durationMinutes: Record<string, number> = {
    '20_30': 25, '30_45': 38, '45_60': 52, '60_plus': 70,
  }
  const sessionMins = durationMinutes[quizData.sessionDuration || '30_45'] || 38

  const exerciseContext =
    format === 'gym'
      ? 'Use gym equipment: dumbbells, barbells, cables, machines, bench. No bodyweight-only exercises.'
      : format === 'home'
      ? 'Home setting: bodyweight, resistance bands, light dumbbells only. No gym machines.'
      : 'Outdoor / calisthenics: park benches, pull-up bars, bodyweight. No gym equipment.'

  const medConditions = quizData.medicalConditions?.filter(c => c !== 'None') || []
  const safetyNotes =
    medConditions.length > 0
      ? `CRITICAL SAFETY: User has ${medConditions.join(', ')}. Modify ALL exercises accordingly. Avoid high-impact moves, heavy spinal loading, or anything contraindicated.`
      : 'No major medical conditions. Standard age-appropriate safety protocols apply.'

  const system = `You are an elite strength & conditioning coach specializing in adults 45+. You design safe, evidence-based workout programs with joint-friendly progressions. You always include warm-up and cool-down in every session. Respond with ONLY valid JSON — no markdown, no explanation.`

  const user = `${profile}

${safetyNotes}
${exerciseContext}

Create a 7-day (Monday–Sunday) personalized workout week with exactly ${freq} training day(s) and ${7 - freq} rest day(s). Each training session is ${sessionMins} minutes.

Rules:
- Every training day MUST start with "Dynamic Warm-Up" and end with "Static Cool-Down" as exercises
- Include 4–7 exercises per training day (not counting warm-up/cool-down)
- Rest time between sets: 60-90s for strength, 45-60s for cardio-focused
- Reps format: "10-12" or "15" or "30 sec" etc.
- Write detailed instructions (2-3 sentences) mentioning why it's beneficial for adults 45+
- For rest days: set exercises to [], isRest to true, durationMinutes to 0

Respond with ONLY this JSON:
{
  "name": "12-Week [Goal] Program",
  "description": "Personalized 2-sentence description referencing their specific goal, level, and training environment",
  "weeksDuration": 12,
  "days": [
    {
      "id": "w1",
      "dayName": "Monday",
      "focus": "Lower Body & Core",
      "durationMinutes": ${sessionMins},
      "isRest": false,
      "exercises": [
        {
          "id": "ex1",
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "restSeconds": 90,
          "instructions": "How to perform it. Why it's great for adults 45+.",
          "muscleGroup": "Legs",
          "weight": "15 kg dumbbells / bodyweight / resistance band"
        }
      ]
    }
  ]
}`

  try {
    const raw = await callGPT([{ role: 'system', content: system }, { role: 'user', content: user }], 3000)
    const parsed = parseJSON<Omit<WorkoutPlan, 'id'>>(raw)
    return { id: `ai-plan-${Date.now()}`, ...parsed }
  } catch (e) {
    console.error('AI workout generation failed, using fallback:', e)
    const { generateWorkoutPlan } = await import('./mockData')
    return generateWorkoutPlan(quizData)
  }
}

// ─── Meal Plan ───────────────────────────────────────────────────────────────

export async function generateMealPlanAI(quizData: Partial<QuizData>, date: string): Promise<MealPlan> {
  const profile = buildProfile(quizData)
  const goal = quizData.trainingGoal || 'improve_fitness'
  const diet = quizData.dietType || 'no_restrictions'

  // Calculate TDEE-based calorie target personalised to the user's weight, age, and activity
  const weightKg = quizData.weightKg || 80
  const heightCm = quizData.heightCm || 175
  const age = quizData.age || 55
  const gender = quizData.gender || 'male'
  const freqN = Number(quizData.trainingFrequency) || 3
  // Mifflin-St Jeor BMR
  const bmr = gender === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  // Activity multiplier (lightly active baseline, bump for frequency)
  const activityMult = freqN <= 2 ? 1.375 : freqN <= 4 ? 1.55 : 1.725
  const tdee = Math.round(bmr * activityMult)

  // Protein targets based on goal (evidence-based ranges):
  // lose_weight:    1.2–1.4 g/kg — preserves muscle on a calorie deficit
  // improve_fitness: 1.2–1.4 g/kg — supports performance at maintenance
  // recomposition:  1.4–1.6 g/kg — simultaneous fat loss + muscle gain
  // build_muscle:   1.6–2.0 g/kg — maximises muscle protein synthesis
  const proteinRanges: Record<string, [number, number]> = {
    lose_weight:     [1.0, 1.1],
    improve_fitness: [1.0, 1.1],
    recomposition:   [1.4, 1.6],
    build_muscle:    [1.6, 2.0],
  }
  const [proteinRatioMin, proteinRatioMax] = proteinRanges[goal] ?? [1.2, 1.4]
  const proteinMin = Math.round(weightKg * proteinRatioMin)
  const proteinMax = Math.round(weightKg * proteinRatioMax)

  const dietInstructions: Record<string, string> = {
    no_restrictions: 'Include a variety of proteins: meat, fish, poultry, eggs, dairy.',
    low_carb: 'STRICT: Max 50g total carbs for the day. High fat, high protein. No grains, no sugar, minimal fruit.',
    vegetarian: 'No meat or fish. Use eggs, dairy, legumes, and plant proteins as main protein sources.',
    vegan: 'Zero animal products. Use tofu, tempeh, legumes, seeds, nutritional yeast for protein.',
    intermittent: 'Skip traditional breakfast. First meal at noon (lunch). Larger dinner. All calories in 8-hour window.',
    mediterranean: 'Emphasize fish (especially fatty fish), olive oil, vegetables, legumes, whole grains, minimal red meat.',
  }

  // Calorie targets per goal (no ranges — single precise value):
  // lose_weight:     TDEE − 500  (1 lb/week fat loss, safe deficit)
  // recomposition:   TDEE − 200  (small deficit lets body use fat for energy)
  // improve_fitness: TDEE        (maintenance — fuel performance, no surplus)
  // build_muscle:    TDEE + 300  (lean bulk — minimal fat gain)
  const calOffset: Record<string, number> = {
    lose_weight:     -500,
    recomposition:   -200,
    improve_fitness:  0,
    build_muscle:    +300,
  }
  const targetCal = Math.round(tdee + (calOffset[goal] ?? 0))

  // Fat targets per goal (% of total calories):
  // lose_weight:     28% — moderate fat preserves hormones on a deficit
  // recomposition:   27% — balanced
  // improve_fitness: 27% — balanced
  // build_muscle:    22% — lower fat leaves more room for carbs (fuel for training)
  const fatPct: Record<string, number> = {
    lose_weight:     0.28,
    recomposition:   0.27,
    improve_fitness: 0.27,
    build_muscle:    0.22,
  }
  const targetFat   = Math.round(targetCal * (fatPct[goal] ?? 0.27) / 9)
  // Carbs: whatever is left after protein and fat — highest for muscle building
  const targetCarbs = Math.round((targetCal - proteinMin * 4 - targetFat * 9) / 4)

  const system = `You are Dr. Elena, a PhD sports nutritionist specializing in metabolic health and body composition for adults 45+. You create practical, science-based meal plans tailored to each user's goals, age, and activity level. Respond with ONLY valid JSON — no markdown, no explanation.`

  const user = `${profile}

NUTRITION TARGETS (calculated from TDEE ${tdee} kcal):
- Calories: ${targetCal} kcal (TDEE ${tdee} kcal ${calOffset[goal] >= 0 ? '+' : ''}${calOffset[goal] ?? 0})
- Protein: ${proteinMin}–${proteinMax}g (${proteinRatioMin}–${proteinRatioMax} g/kg for goal: ${goal.replace('_', ' ')} — do NOT exceed ${proteinMax}g)
- Carbs: ~${targetCarbs}g
- Fat: ~${targetFat}g
Diet requirement: ${dietInstructions[diet] || dietInstructions.no_restrictions}

Create a complete daily meal plan for ${date}. Include: breakfast, lunch, snack, dinner.
(If intermittent fasting diet: skip breakfast, first meal = lunch)

STRICT RULES:
1. The sum of all meal calories MUST equal exactly ${targetCal} kcal (±30 kcal tolerance).
2. The sum of all meal protein MUST equal ${proteinMin}–${proteinMax}g total. Do NOT put more than ${proteinMax}g protein in any single day.
3. The sum of all meal carbs MUST equal approximately ${targetCarbs}g.
4. The sum of all meal fat MUST equal approximately ${targetFat}g.
5. Distribute carbs strategically: more carbs at breakfast and lunch (pre/post workout energy), fewer at dinner.
6. Dinner should be the largest meal by calories but lower in carbs (focus on protein + vegetables + healthy fat).
7. Make meals practical, delicious, and easy to prepare. Use commonly available ingredients.

Respond with ONLY this JSON (totalCalories/totalProtein/totalCarbs/totalFat MUST be the arithmetic sum of the meals, not estimates):
{
  "totalCalories": ${targetCal},
  "totalProtein": ${proteinMin},
  "totalCarbs": ${targetCarbs},
  "totalFat": ${targetFat},
  "meals": [
    {
      "name": "Meal name",
      "type": "breakfast",
      "calories": 500,
      "protein": 35,
      "carbs": 55,
      "fat": 12,
      "ingredients": ["200g Greek yogurt", "1 cup blueberries", "30g granola"],
      "recipe": "Step-by-step preparation instructions in 3-4 sentences.",
      "prepTime": "10 min"
    }
  ]
}`

  try {
    const raw = await callGPT([{ role: 'system', content: system }, { role: 'user', content: user }], 2000)
    const parsed = parseJSON<Omit<MealPlan, 'date'>>(raw)
    // Recalculate totals from actual meals to ensure header always matches
    const totalCalories = parsed.meals.reduce((s, m) => s + m.calories, 0)
    const totalProtein  = parsed.meals.reduce((s, m) => s + m.protein, 0)
    const totalCarbs    = parsed.meals.reduce((s, m) => s + m.carbs, 0)
    const totalFat      = parsed.meals.reduce((s, m) => s + m.fat, 0)
    return { date, ...parsed, totalCalories, totalProtein, totalCarbs, totalFat }
  } catch (e) {
    console.error('AI meal generation failed, using fallback:', e)
    const { generateMealPlan } = await import('./mockData')
    return generateMealPlan(quizData, date)
  }
}

export async function generateWeekMealPlansAI(quizData: Partial<QuizData>): Promise<MealPlan[]> {
  const today = new Date()
  // Generate 3 days in parallel, then the next 4 — to avoid rate limits
  const makeDateStr = (i: number) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  }
  const firstHalf = await Promise.all([0, 1, 2].map(i => generateMealPlanAI(quizData, makeDateStr(i))))
  const secondHalf = await Promise.all([3, 4, 5, 6].map(i => generateMealPlanAI(quizData, makeDateStr(i))))
  return [...firstHalf, ...secondHalf]
}

// ─── AI Chat Agents ──────────────────────────────────────────────────────────

const agentSystemPrompts: Record<string, string> = {
  trainer: `You are Coach Marcus, an elite personal trainer with 20+ years of experience working with adults 45+. Your expertise:
- Joint-safe exercise selection and progressive overload for aging bodies
- Hormonal optimization through training (natural hormone support)
- Age-specific recovery protocols (48-72h muscle group rest, sleep quality)
- Exercise modifications for common conditions (back pain, knee issues, hypertension)
- Evidence-based periodization for older athletes

Communication style:
- Direct, encouraging, and knowledgeable — like a trusted coach, not a textbook
- Give specific, actionable advice with real numbers (sets, reps, rest periods, weights)
- Always explain the "why" behind recommendations
- Keep responses concise: 3-6 sentences unless a detailed explanation is requested
- Reference the user's specific profile details (their goal, level, medical conditions) in your answers`,

  nutritionist: `You are Dr. Elena, a PhD-level sports nutritionist specializing in metabolic health for adults 45+. Your expertise:
- Protein synthesis optimization (1.6-2.2g/kg for muscle retention in older adults)
- Anti-inflammatory nutrition protocols (omega-3s, polyphenols, gut health)
- Hormonal nutrition (foods that support hormone balance, manage cortisol and insulin)
- Evidence-based supplementation for adults 45+ (creatine, vitamin D, magnesium, zinc)
- Practical meal timing and pre/post-workout nutrition

Communication style:
- Warm and practical — you translate complex nutrition science into actionable advice
- Give specific numbers when relevant (grams of protein, specific foods, timing windows)
- Reference the user's diet style and goals in every answer
- Keep responses focused: 3-5 sentences with clear takeaways
- Occasionally mention the evidence base for your recommendations (briefly)`,

  psychologist: `You are Dr. James, a licensed sports psychologist specializing in habit formation and athletic motivation for adults 45+. Your expertise:
- Identity-based habit formation ("I am someone who trains" vs "I should train")
- Overcoming age-related psychological barriers (imposter syndrome, perfectionism, all-or-nothing thinking)
- Stress and cortisol management for better recovery and performance
- Consistency strategies: implementation intentions, habit stacking, accountability systems
- Motivation science: intrinsic vs extrinsic drivers, goal-setting, self-compassion

Communication style:
- Warm, genuinely empathetic — you validate feelings before offering strategies
- Psychologically grounded but accessible (no jargon)
- Practical: every response should include at least one actionable strategy
- Conversational and human, not clinical
- Reference the user's specific motivation and previous obstacles to show you understand their journey`,
}

export async function getAgentResponseAI(
  agentType: string,
  conversationHistory: { role: string; content: string }[],
  quizData: Partial<QuizData>
): Promise<string> {
  const profile = buildProfile(quizData)
  const basePrompt = agentSystemPrompts[agentType] || agentSystemPrompts.trainer

  const systemMessage = {
    role: 'system',
    content: `${basePrompt}

${profile}

Use this profile to personalize every response. When relevant, reference specific details: their age, goal, fitness level, medical conditions, diet, motivation, and obstacles. Never give generic advice that ignores who they are.`,
  }

  const messages = [systemMessage, ...conversationHistory]

  try {
    return await callGPT(messages, 600)
  } catch (e) {
    console.error('Agent response failed:', e)
    return "I'm having trouble connecting right now. Please try again in a moment."
  }
}

// ─── Food Photo Analysis ─────────────────────────────────────────────────────

export interface FoodAnalysisResult {
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  portionDescription: string
  healthScore: number        // 1–10
  notes: string
}

export async function analyzeFoodPhotoAI(base64Image: string, mimeType = 'image/jpeg'): Promise<FoodAnalysisResult> {
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'low' },
        },
        {
          type: 'text',
          text: `Analyze the food in this image and estimate its nutritional content for the visible portion.
Return ONLY valid JSON (no markdown) in this exact shape:
{
  "foodName": "string — name of the dish/food",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "portionDescription": "string — estimated portion size (e.g. '200g' or '1 cup')",
  "healthScore": number (1-10, 10 = very healthy),
  "notes": "string — 1-2 sentence nutrition tip or observation"
}`,
        },
      ],
    },
  ]
  const raw = await callGPT(messages, 400, 'gpt-4o')
  return parseJSON<FoodAnalysisResult>(raw)
}

// Re-export agent personalities for intro messages (still used in ChatPage)
export { agentPersonalities } from './mockData'
