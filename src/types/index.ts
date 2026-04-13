export interface QuizData {
  age: number
  gender: string
  heightCm: number
  weightKg: number
  trainingGoal: string
  primaryMotivation: string
  bodyGoal: string
  fitnessLevel: string
  previousObstacle: string
  trainingFrequency: number
  trainingFormat: string
  sessionDuration: string
  sleepHours: string
  dietType: string
  stressLevel: string
  medicalConditions: string[]
  medicalNotes: string
  photoUrl: string | null
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  restSeconds: number
  instructions: string
  muscleGroup: string
}

export interface WorkoutDay {
  id: string
  dayName: string
  focus: string
  exercises: Exercise[]
  durationMinutes: number
  isRest?: boolean
}

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  weeksDuration: number
  days: WorkoutDay[]
}

export interface Meal {
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  recipe: string
  prepTime: string
}

export interface MealPlan {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  meals: Meal[]
}

export interface WorkoutLog {
  id: string
  workoutName: string
  completedAt: string
  durationMinutes: number
  exercisesCompleted: number
}
