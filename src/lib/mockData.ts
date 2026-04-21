import type { QuizData, WorkoutPlan, MealPlan, WorkoutDay, Exercise, Meal } from '../types'

const gymExercisesStrength: Exercise[] = [
  { id: 'sq', name: 'Goblet Squat', sets: 3, reps: '10-12', restSeconds: 90, instructions: 'Hold a dumbbell at chest height. Feet shoulder-width apart. Squat deep, keeping chest up. Great for knees—easier than barbell squats.', muscleGroup: 'Legs' },
  { id: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '10', restSeconds: 90, instructions: 'Hold dumbbells in front. Hinge at hips, pushing them back. Lower until you feel hamstring stretch. Keep back flat throughout.', muscleGroup: 'Hamstrings' },
  { id: 'bp', name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', restSeconds: 90, instructions: 'Lie on bench, dumbbells at chest level. Press up and slightly together. Control the descent. Easier on shoulder joints than barbell.', muscleGroup: 'Chest' },
  { id: 'row', name: 'Cable Row', sets: 3, reps: '12', restSeconds: 75, instructions: 'Sit at cable row machine. Pull handle to lower chest, squeezing shoulder blades together. Hold 1 second at peak contraction.', muscleGroup: 'Back' },
  { id: 'op', name: 'Seated Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 90, instructions: 'Sit on bench with back support. Press dumbbells overhead, stopping just before lockout. Seated takes pressure off lower back.', muscleGroup: 'Shoulders' },
  { id: 'lat', name: 'Lat Pulldown', sets: 3, reps: '12', restSeconds: 75, instructions: 'Grip bar slightly wider than shoulder-width. Pull down to upper chest while leaning back slightly. Squeeze lats at bottom.', muscleGroup: 'Back' },
  { id: 'lp', name: 'Leg Press', sets: 3, reps: '12-15', restSeconds: 90, instructions: 'Place feet shoulder-width on platform. Lower until 90-degree angle. Push through heels. Joint-friendly alternative to squats.', muscleGroup: 'Quads' },
  { id: 'curl', name: 'Dumbbell Curl', sets: 3, reps: '12', restSeconds: 60, instructions: 'Stand with dumbbells at sides. Curl both arms together, squeezing biceps at top. Lower slowly for full stretch.', muscleGroup: 'Biceps' },
  { id: 'ext', name: 'Tricep Pushdown', sets: 3, reps: '12-15', restSeconds: 60, instructions: 'At cable machine, push rope or bar down until arms straight. Keep elbows at sides. Great for elbow health.', muscleGroup: 'Triceps' },
  { id: 'calf', name: 'Calf Raise Machine', sets: 3, reps: '15-20', restSeconds: 60, instructions: 'Place balls of feet on platform edge. Rise up fully, pause at top, lower slowly. Strengthens ankles and reduces injury risk.', muscleGroup: 'Calves' },
]

const homeExercises: Exercise[] = [
  { id: 'pwall', name: 'Wall Push-Up', sets: 3, reps: '15', restSeconds: 60, instructions: 'Stand arm-length from wall. Place hands flat at shoulder height. Lower chest to wall, push back. Great starting point for upper body strength.', muscleGroup: 'Chest' },
  { id: 'kpush', name: 'Knee Push-Up', sets: 3, reps: '10-15', restSeconds: 60, instructions: 'Kneel on floor, hands shoulder-width. Lower chest to floor and push up. Builds chest and arm strength before progressing to full push-ups.', muscleGroup: 'Chest' },
  { id: 'chair', name: 'Chair-Assisted Squat', sets: 3, reps: '12-15', restSeconds: 75, instructions: 'Stand in front of chair. Lower yourself as if sitting down, touch chair, stand back up. Perfect for building leg strength safely.', muscleGroup: 'Legs' },
  { id: 'glute', name: 'Glute Bridge', sets: 3, reps: '15', restSeconds: 60, instructions: 'Lie on back, knees bent, feet flat. Lift hips until body forms straight line. Squeeze glutes at top, hold 2 seconds. Great for back health.', muscleGroup: 'Glutes' },
  { id: 'march', name: 'Standing High March', sets: 3, reps: '20 each', restSeconds: 60, instructions: 'Stand tall, lift knees alternately to hip height. Swing opposite arm. Improves balance, hip flexor strength, and coordination.', muscleGroup: 'Core/Cardio' },
  { id: 'band', name: 'Resistance Band Row', sets: 3, reps: '12-15', restSeconds: 75, instructions: 'Loop band around door handle or sturdy object. Pull handles to your sides, squeezing shoulder blades. Stand or sit.', muscleGroup: 'Back' },
  { id: 'plank', name: 'Modified Plank', sets: 3, reps: '20-30 sec', restSeconds: 60, instructions: 'On knees and forearms. Body straight from knees to shoulders. Brace core, breathe steadily. Progress to full plank over time.', muscleGroup: 'Core' },
  { id: 'calf2', name: 'Standing Calf Raise', sets: 3, reps: '20', restSeconds: 45, instructions: 'Stand near wall for balance. Rise up on tiptoes, hold 2 seconds, lower slowly. Strengthens calves and improves balance.', muscleGroup: 'Calves' },
  { id: 'step', name: 'Step-Up (Stairs)', sets: 3, reps: '10 each side', restSeconds: 75, instructions: 'Step up with one foot, bring other foot up, step back down. Use handrail for balance if needed. Excellent functional leg exercise.', muscleGroup: 'Legs' },
  { id: 'stretch', name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each', restSeconds: 30, instructions: 'Kneel on one knee, other foot forward. Push hips forward gently. Relieves tightness from sitting. Essential for adults 45+.', muscleGroup: 'Flexibility' },
]

const outdoorExercises: Exercise[] = [
  { id: 'walk', name: 'Brisk Walk', sets: 1, reps: '15 min', restSeconds: 60, instructions: 'Walk at pace where you can talk but breathing is slightly elevated. Arms swing naturally. This is your warm-up and base cardio.', muscleGroup: 'Cardio' },
  { id: 'bpush', name: 'Bench Push-Up', sets: 3, reps: '12-15', restSeconds: 60, instructions: 'Use park bench for incline push-ups. Hands on bench edge, feet back. Great progression from wall push-ups outdoors.', muscleGroup: 'Chest' },
  { id: 'brow', name: 'Bench Dip', sets: 3, reps: '10-12', restSeconds: 75, instructions: 'Hands on bench behind you, feet forward. Lower body by bending elbows to 90°. Press back up. Works triceps and shoulders.', muscleGroup: 'Triceps' },
  { id: 'lunge', name: 'Walking Lunge', sets: 3, reps: '10 each side', restSeconds: 75, instructions: 'Step forward into lunge, alternating legs. Keep front knee over ankle. Hold railing or use shorter stride if needed for balance.', muscleGroup: 'Legs' },
  { id: 'pull', name: 'Australian Pull-Up', sets: 3, reps: '8-10', restSeconds: 90, instructions: 'Find low bar or railing. Body at 45° angle, heels on ground. Pull chest to bar. Easier than full pull-up, great for back.', muscleGroup: 'Back' },
  { id: 'jog', name: 'Interval Walking/Jogging', sets: 5, reps: '2 min walk + 30 sec jog', restSeconds: 60, instructions: 'Alternate between brisk walk and gentle jog. Adjust based on how you feel. This builds cardio without stressing joints.', muscleGroup: 'Cardio' },
  { id: 'bear', name: 'Bear Crawl', sets: 3, reps: '20 meters', restSeconds: 90, instructions: 'On hands and knees, lift knees slightly. Move forward using opposite arm/leg. Builds total body strength and coordination.', muscleGroup: 'Full Body' },
  { id: 'bsq', name: 'Bodyweight Squat', sets: 3, reps: '15-20', restSeconds: 60, instructions: 'Feet shoulder-width, squat to parallel or below. Arms forward for balance. Use park bench behind you as safety target if needed.', muscleGroup: 'Legs' },
]

function selectExercises(format: string, _goal: string, fitnessLevel: string): Exercise[] {
  const basePool = format === 'gym' ? gymExercisesStrength : format === 'home' ? homeExercises : outdoorExercises
  const count = fitnessLevel === 'beginner' ? 4 : fitnessLevel === 'intermediate' ? 5 : fitnessLevel === 'advanced' ? 6 : 7
  const warmup: Exercise = { id: 'warmup', name: 'Dynamic Warm-Up', sets: 1, reps: '5 min', restSeconds: 0, instructions: 'Arm circles, leg swings, gentle torso rotations, ankle rolls. Gets joints and muscles ready. Never skip this at 45+!', muscleGroup: 'Warm-Up' }
  const cooldown: Exercise = { id: 'cooldown', name: 'Static Stretching Cool-Down', sets: 1, reps: '5-10 min', restSeconds: 0, instructions: 'Hold each stretch 30 seconds. Focus on quads, hamstrings, chest, and back. Reduces soreness and improves flexibility.', muscleGroup: 'Cool-Down' }
  return [warmup, ...basePool.slice(0, count), cooldown]
}

function buildWorkoutDays(quizData: Partial<QuizData>): WorkoutDay[] {
  const freq = quizData.trainingFrequency || 3
  const format = quizData.trainingFormat || 'gym'
  const goal = quizData.trainingGoal || 'improve_fitness'
  const level = quizData.fitnessLevel || 'beginner'

  const workoutTemplates = [
    { dayName: 'Monday', focus: 'Lower Body & Core' },
    { dayName: 'Wednesday', focus: 'Upper Body Push' },
    { dayName: 'Friday', focus: 'Upper Body Pull & Full Body' },
    { dayName: 'Tuesday', focus: 'Active Recovery / Cardio' },
    { dayName: 'Thursday', focus: 'Total Body Strength' },
  ]

  const restDay = (name: string): WorkoutDay => ({
    id: `rest-${name}`,
    dayName: name,
    focus: 'Rest & Recovery',
    exercises: [],
    durationMinutes: 0,
    isRest: true,
  })

  const duration = level === 'beginner' ? 35 : level === 'intermediate' ? 45 : level === 'advanced' ? 55 : 65

  if (freq === 1) {
    return [
      { id: 'w1', dayName: 'Saturday', focus: 'Full Body', exercises: selectExercises(format, goal, level), durationMinutes: duration },
      restDay('Sunday'), restDay('Monday'), restDay('Tuesday'), restDay('Wednesday'), restDay('Thursday'), restDay('Friday'),
    ]
  }
  if (freq === 3) {
    return [
      { id: 'w1', dayName: 'Monday', focus: 'Lower Body', exercises: selectExercises(format, goal, level), durationMinutes: duration },
      restDay('Tuesday'),
      { id: 'w2', dayName: 'Wednesday', focus: 'Upper Body', exercises: selectExercises(format, goal, level), durationMinutes: duration },
      restDay('Thursday'),
      { id: 'w3', dayName: 'Friday', focus: 'Full Body', exercises: selectExercises(format, goal, level), durationMinutes: duration },
      restDay('Saturday'), restDay('Sunday'),
    ]
  }
  return workoutTemplates.slice(0, 5).map((t, i) => ({
    id: `w${i + 1}`,
    dayName: t.dayName,
    focus: t.focus,
    exercises: selectExercises(format, goal, level),
    durationMinutes: duration,
  })).concat([restDay('Saturday'), restDay('Sunday')])
}

export function generateWorkoutPlan(quizData: Partial<QuizData>): WorkoutPlan {
  const goalNames: Record<string, string> = {
    build_muscle: 'Muscle Building',
    lose_weight: 'Fat Loss',
    recomposition: 'Body Recomposition',
    improve_fitness: 'Fitness Improvement',
  }
  const goalName = goalNames[quizData.trainingGoal || 'improve_fitness'] || 'Fitness'
  return {
    id: 'plan-1',
    name: `12-Week ${goalName} Program`,
    description: `A personalized ${goalName.toLowerCase()} program designed for adults 45+, optimized for your fitness level and schedule. Joint-friendly exercises with progressive overload.`,
    weeksDuration: 12,
    days: buildWorkoutDays(quizData),
  }
}

const mealDatabase: Meal[][] = [
  [
    { name: 'Greek Yogurt Power Bowl', type: 'breakfast', calories: 380, protein: 32, carbs: 42, fat: 8, ingredients: ['200g Greek yogurt', '1 cup blueberries', '30g granola', '1 tbsp honey', '15g walnuts'], recipe: 'Layer yogurt in bowl, top with berries, granola, and walnuts. Drizzle honey. Rich in probiotics and protein for muscle recovery.', prepTime: '5 min' },
    { name: 'Grilled Salmon with Quinoa & Asparagus', type: 'lunch', calories: 520, protein: 45, carbs: 38, fat: 16, ingredients: ['180g salmon fillet', '80g quinoa', '150g asparagus', 'lemon', 'olive oil', 'garlic', 'dill'], recipe: 'Season salmon with lemon, garlic, dill. Grill 4 min per side. Cook quinoa. Roast asparagus with olive oil. Anti-inflammatory omega-3s for joint health.', prepTime: '25 min' },
    { name: 'Turkey & Avocado Lettuce Wraps', type: 'snack', calories: 220, protein: 18, carbs: 8, fat: 12, ingredients: ['100g ground turkey', '½ avocado', 'romaine leaves', 'tomato', 'lime juice'], recipe: 'Cook turkey with spices. Place in lettuce cups with diced avocado and tomato. Healthy fats support testosterone production.', prepTime: '15 min' },
    { name: 'Herb-Crusted Chicken Thighs with Sweet Potato', type: 'dinner', calories: 580, protein: 48, carbs: 52, fat: 14, ingredients: ['200g chicken thighs', '1 large sweet potato', 'rosemary', 'thyme', 'garlic', 'olive oil', 'green beans'], recipe: 'Rub chicken with herbs and garlic. Bake at 200°C for 35 min. Serve with roasted sweet potato and steamed green beans.', prepTime: '45 min' },
  ],
  [
    { name: 'Smoked Salmon & Egg Scramble', type: 'breakfast', calories: 420, protein: 38, carbs: 12, fat: 22, ingredients: ['3 eggs', '80g smoked salmon', '½ avocado', 'capers', 'red onion', 'dill'], recipe: 'Scramble eggs softly over low heat. Fold in smoked salmon at the end. Serve with sliced avocado and capers. Protein and omega-3 powerhouse.', prepTime: '10 min' },
    { name: 'Mediterranean Chicken Bowl', type: 'lunch', calories: 490, protein: 42, carbs: 45, fat: 13, ingredients: ['160g grilled chicken', '80g brown rice', 'cucumber', 'cherry tomatoes', 'olives', 'feta', 'tzatziki'], recipe: 'Grill chicken with oregano and lemon. Serve over rice with chopped vegetables, olives, and a dollop of tzatziki. Mediterranean diet reduces inflammation.', prepTime: '30 min' },
    { name: 'Apple & Almond Butter', type: 'snack', calories: 195, protein: 5, carbs: 28, fat: 10, ingredients: ['1 large apple', '2 tbsp almond butter'], recipe: 'Slice apple and dip in almond butter. Simple, satisfying snack with fiber and healthy fats that stabilizes blood sugar.', prepTime: '3 min' },
    { name: 'Beef & Vegetable Stir-Fry with Brown Rice', type: 'dinner', calories: 560, protein: 44, carbs: 55, fat: 14, ingredients: ['180g lean beef strips', '80g brown rice', 'broccoli', 'bell peppers', 'snap peas', 'ginger', 'soy sauce', 'sesame oil'], recipe: 'Stir-fry beef in high heat 3 min. Add vegetables and ginger. Finish with soy sauce and sesame oil. Serve over brown rice. High zinc for testosterone.', prepTime: '25 min' },
  ],
  [
    { name: 'Overnight Oats with Chia & Banana', type: 'breakfast', calories: 395, protein: 18, carbs: 62, fat: 10, ingredients: ['80g rolled oats', '250ml almond milk', '2 tbsp chia seeds', '1 banana', '1 tbsp peanut butter', 'cinnamon'], recipe: 'Mix oats, milk, chia seeds the night before. In the morning, top with sliced banana and peanut butter. Slow-release energy for sustained workouts.', prepTime: '5 min (prep night before)' },
    { name: 'Lentil & Spinach Soup with Sourdough', type: 'lunch', calories: 445, protein: 28, carbs: 65, fat: 8, ingredients: ['200g red lentils', '2 cups spinach', 'carrots', 'celery', 'turmeric', 'cumin', 'sourdough bread'], recipe: 'Sauté vegetables, add lentils and 1L water. Season with turmeric and cumin. Simmer 20 min. Serve with sourdough. Lentils are anti-inflammatory plant protein.', prepTime: '30 min' },
    { name: 'Cottage Cheese with Berries', type: 'snack', calories: 185, protein: 22, carbs: 18, fat: 4, ingredients: ['200g low-fat cottage cheese', '100g mixed berries', 'vanilla extract'], recipe: 'Combine cottage cheese with berries and a drop of vanilla. High in casein protein for muscle preservation throughout the day.', prepTime: '2 min' },
    { name: 'Baked Cod with Roasted Vegetables & Quinoa', type: 'dinner', calories: 495, protein: 46, carbs: 48, fat: 10, ingredients: ['200g cod fillet', '80g quinoa', 'zucchini', 'bell peppers', 'cherry tomatoes', 'lemon', 'capers', 'parsley'], recipe: 'Season cod with lemon and capers. Bake 18 min at 190°C. Roast vegetables with olive oil. Serve over quinoa. Light, digestible evening protein.', prepTime: '35 min' },
  ],
  [
    { name: 'Spinach & Feta Omelette with Whole Grain Toast', type: 'breakfast', calories: 410, protein: 35, carbs: 28, fat: 18, ingredients: ['4 eggs', '100g fresh spinach', '40g feta cheese', '2 slices whole grain bread', 'olive oil', 'cherry tomatoes'], recipe: 'Sauté spinach 2 min. Pour beaten eggs over, add feta, fold. Serve with toasted bread and tomatoes. Complete amino acid profile for muscle building.', prepTime: '12 min' },
    { name: 'Tuna Poke Bowl', type: 'lunch', calories: 510, protein: 44, carbs: 52, fat: 12, ingredients: ['160g sushi-grade tuna', '80g sushi rice', 'edamame', 'cucumber', 'avocado', 'nori', 'soy sauce', 'sesame seeds'], recipe: 'Cube tuna, marinate in soy sauce 10 min. Arrange over rice with edamame, cucumber, and avocado. Top with sesame seeds and nori strips.', prepTime: '20 min' },
    { name: 'Mixed Nuts & Dark Chocolate', type: 'snack', calories: 210, protein: 6, carbs: 14, fat: 16, ingredients: ['30g mixed nuts', '2 squares dark chocolate (85%)'], recipe: 'Simple combination of heart-healthy nuts and dark chocolate. Provides magnesium for muscle recovery and mood support.', prepTime: '1 min' },
    { name: 'Slow-Cooked Turkey Chili', type: 'dinner', calories: 540, protein: 50, carbs: 48, fat: 12, ingredients: ['200g ground turkey', 'kidney beans', 'black beans', 'crushed tomatoes', 'chili spices', 'onion', 'garlic', 'corn'], recipe: 'Brown turkey. Add all ingredients. Simmer 30 min (or slow cook 4 hours). High protein, high fiber meal that keeps you full and supports gut health.', prepTime: '40 min' },
  ],
  [
    { name: 'Protein Pancakes with Fresh Fruit', type: 'breakfast', calories: 430, protein: 36, carbs: 50, fat: 8, ingredients: ['2 eggs', '1 banana', '40g oats', '1 scoop protein powder', 'blueberries', 'maple syrup'], recipe: 'Blend eggs, banana, oats, and protein powder. Cook small pancakes 3 min per side. Top with berries and light drizzle of maple syrup.', prepTime: '15 min' },
    { name: 'Chicken Shawarma Plate', type: 'lunch', calories: 530, protein: 46, carbs: 42, fat: 16, ingredients: ['180g chicken thighs', 'hummus', 'pita bread', 'tabbouleh', 'cucumber', 'tomato', 'tahini sauce', 'lemon'], recipe: 'Marinate chicken in shawarma spices. Grill or bake. Serve with hummus, tabbouleh, and vegetables. Middle Eastern spices have anti-inflammatory properties.', prepTime: '30 min' },
    { name: 'Edamame with Sea Salt', type: 'snack', calories: 170, protein: 14, carbs: 14, fat: 5, ingredients: ['200g edamame pods', 'sea salt'], recipe: 'Steam or microwave edamame 5 min. Sprinkle sea salt. Plant-based protein and phytoestrogen-balancing soy for hormonal health in adults 45+.', prepTime: '5 min' },
    { name: 'Pan-Seared Trout with Cauliflower Mash & Sautéed Kale', type: 'dinner', calories: 510, protein: 42, carbs: 32, fat: 18, ingredients: ['200g rainbow trout', '1 head cauliflower', '200g kale', 'lemon', 'butter', 'garlic', 'almonds'], recipe: 'Pan-sear trout 4 min per side. Steam cauliflower, mash with butter and garlic. Sauté kale with garlic and almonds. Rich in brain-healthy omega-3s.', prepTime: '35 min' },
  ],
  [
    { name: 'Açaí Bowl with Granola & Tropical Fruit', type: 'breakfast', calories: 400, protein: 14, carbs: 68, fat: 12, ingredients: ['200g açaí puree', 'mango', 'pineapple', 'kiwi', '30g granola', 'coconut flakes', 'honey'], recipe: 'Blend açaí with frozen banana. Pour into bowl, top with chopped tropical fruits, granola, and coconut. Antioxidant-rich recovery breakfast.', prepTime: '10 min' },
    { name: 'Thai Green Curry with Tofu & Brown Rice', type: 'lunch', calories: 480, protein: 28, carbs: 58, fat: 16, ingredients: ['200g firm tofu', '80g brown rice', 'green curry paste', 'coconut milk', 'bamboo shoots', 'Thai basil', 'green beans'], recipe: 'Press tofu, cube and pan-fry golden. Add curry paste, coconut milk, and vegetables. Simmer 10 min. Serve over rice. Plant-based day for gut diversity.', prepTime: '30 min' },
    { name: 'Hummus with Vegetable Crudités', type: 'snack', calories: 195, protein: 10, carbs: 22, fat: 8, ingredients: ['100g hummus', 'carrots', 'celery', 'cucumber', 'bell pepper', 'pita chips'], recipe: 'Serve hummus with raw vegetables and pita chips. Chickpeas provide plant protein and fiber. Great for digestive health and sustained energy.', prepTime: '5 min' },
    { name: 'Grilled Sirloin Steak with Asparagus & Baked Potato', type: 'dinner', calories: 620, protein: 52, carbs: 48, fat: 20, ingredients: ['180g sirloin steak', '150g asparagus', '1 medium potato', 'olive oil', 'rosemary', 'garlic butter', 'sour cream'], recipe: 'Season steak with salt and pepper. Grill to desired doneness. Serve with roasted asparagus and baked potato with sour cream. Excellent zinc and iron source.', prepTime: '30 min' },
  ],
  [
    { name: 'Avocado Toast with Poached Eggs & Smoked Paprika', type: 'breakfast', calories: 445, protein: 24, carbs: 38, fat: 24, ingredients: ['2 eggs', '½ avocado', '2 slices sourdough', 'smoked paprika', 'chili flakes', 'lemon juice', 'microgreens'], recipe: 'Toast sourdough. Mash avocado with lemon and seasoning. Poach eggs. Assemble and top with paprika and microgreens. Perfect balance of healthy fats and protein.', prepTime: '15 min' },
    { name: 'Lamb & Vegetable Stuffed Bell Peppers', type: 'lunch', calories: 520, protein: 40, carbs: 38, fat: 20, ingredients: ['150g lean lamb mince', '2 bell peppers', 'tomatoes', 'feta', 'mint', 'brown rice', 'pine nuts', 'olive oil'], recipe: 'Brown lamb with spices. Mix with rice, tomatoes, and mint. Stuff into peppers. Top with feta and pine nuts. Bake 25 min. Iron-rich for energy.', prepTime: '45 min' },
    { name: 'Protein Shake with Banana', type: 'snack', calories: 240, protein: 28, carbs: 30, fat: 3, ingredients: ['1 scoop whey protein', '1 banana', '300ml almond milk', 'ice'], recipe: 'Blend all ingredients until smooth. Excellent post-workout recovery shake. Whey protein is the gold standard for muscle protein synthesis.', prepTime: '3 min' },
    { name: 'Miso-Glazed Sea Bass with Bok Choy & Jasmine Rice', type: 'dinner', calories: 530, protein: 44, carbs: 52, fat: 14, ingredients: ['180g sea bass', '80g jasmine rice', '2 bok choy', 'white miso', 'mirin', 'soy sauce', 'ginger', 'sesame oil'], recipe: 'Mix miso, mirin, and soy sauce. Marinate sea bass 30 min. Broil 8 min. Stir-fry bok choy with ginger and sesame oil. Serve over jasmine rice.', prepTime: '45 min' },
  ],
]

export function generateMealPlan(quizData: Partial<QuizData>, date: string, dayIndex: number = 0): MealPlan {
  const baseCalories = quizData.trainingGoal === 'lose_weight' ? 1800 : quizData.trainingGoal === 'build_muscle' ? 2600 : 2200
  const dayMeals = mealDatabase[dayIndex % mealDatabase.length]
  const scaleFactor = baseCalories / dayMeals.reduce((sum, m) => sum + m.calories, 0)

  const scaledMeals: Meal[] = dayMeals.map(meal => ({
    ...meal,
    calories: Math.round(meal.calories * scaleFactor),
    protein: Math.round(meal.protein * scaleFactor),
    carbs: Math.round(meal.carbs * scaleFactor),
    fat: Math.round(meal.fat * scaleFactor),
  }))

  return {
    date,
    totalCalories: scaledMeals.reduce((s, m) => s + m.calories, 0),
    totalProtein: scaledMeals.reduce((s, m) => s + m.protein, 0),
    totalCarbs: scaledMeals.reduce((s, m) => s + m.carbs, 0),
    totalFat: scaledMeals.reduce((s, m) => s + m.fat, 0),
    meals: scaledMeals,
  }
}

export function generateWeekMealPlans(quizData: Partial<QuizData>): MealPlan[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return generateMealPlan(quizData, d.toISOString().split('T')[0], i)
  })
}

export function getMotivationalMessage(completedWorkouts: number): string {
  const messages = [
    "Every rep counts. You're building something incredible.",
    "Consistency beats perfection. You showed up — that's everything.",
    "Your future self is thanking you right now. Keep going.",
    "Strong bodies aren't born — they're built one workout at a time.",
    "Age is just a number. Your dedication is timeless.",
    "The hardest step is always the first. You've already taken it.",
    "Recovery is progress. Rest well and come back stronger.",
    "You're in the top 5% just by showing up consistently.",
    "Champions are made in the moments you want to quit but don't.",
    "This is your time. Nobody else can do this work for you.",
  ]
  return messages[completedWorkouts % messages.length]
}

const agentPersonalities = {
  trainer: {
    name: 'Coach Marcus',
    intro: "Hey! I'm Coach Marcus, your personal fitness trainer. I specialize in training adults 45+ and helping them achieve results they never thought possible. What would you like to know about your workout program?",
  },
  nutritionist: {
    name: 'Dr. Elena',
    intro: "Hi there! I'm Dr. Elena, your nutritionist. I'll help you fuel your body for performance and longevity. Whether it's meal timing, macros, or specific foods — I'm here for all your nutrition questions.",
  },
  psychologist: {
    name: 'Dr. James',
    intro: "Hello! I'm Dr. James, your sports psychologist. My job is to keep you motivated, manage stress, and help you build the mental resilience to stay consistent. What's on your mind?",
  },
}

const mockResponses: Record<string, string[]> = {
  trainer: [
    "For adults 45+, I always emphasize joint health first. Use the RPE (Rate of Perceived Exertion) scale — aim for 6-7 out of 10 effort. This builds strength while keeping injury risk low.",
    "Progressive overload is key. Increase weight by 2-5% only when you can complete all reps with perfect form. Don't rush — slow and steady wins the race after 45.",
    "Recovery is where the gains happen! At your age, you need 48-72 hours between training the same muscle group. Sleep 7-9 hours, and don't skip rest days.",
    "I'd recommend modifying that exercise. Instead of heavy barbell squats, try goblet squats or leg press. Same stimulus, much easier on your knees and lower back.",
    "Your workout plan has been updated! I've incorporated your feedback and adjusted the intensity to match your current fitness level. Always listen to your body.",
  ],
  nutritionist: [
    "At 45+, protein becomes even more critical. Aim for 1.6-2g per kg of bodyweight to combat muscle loss. Spread it across 4 meals for optimal absorption.",
    "Anti-inflammatory eating should be a priority. Include fatty fish (salmon, mackerel) 3x per week, colorful vegetables, olive oil, and reduce processed foods.",
    "Pre-workout nutrition: eat a balanced meal 2-3 hours before training. If training in the morning, a banana and coffee works well. Post-workout: protein within 2 hours.",
    "I've regenerated your meal plan with more variety! Today features Mediterranean-inspired dishes — research shows this dietary pattern is optimal for adults over 45.",
    "Creatine monohydrate is the most researched supplement for adults 45+. 5g daily can improve strength, muscle mass, and even cognitive function. Worth discussing with your doctor.",
  ],
  psychologist: [
    "Building a habit takes 66 days on average, not 21. Be patient with yourself. Focus on identity-based habits — 'I am someone who exercises' rather than 'I need to exercise.'",
    "When motivation is low, remember your WHY. Write down 3 reasons you started this journey. Put them somewhere visible. Motivation follows action, not the other way around.",
    "Plateau is normal. It's your body adapting — which is actually a sign of progress! Use it as a cue to add variety or intensity, not a reason to quit.",
    "Stress and cortisol are muscle's biggest enemies. Practice 5-minute deep breathing before workouts. This activates your parasympathetic system and improves performance.",
    "You've been consistent for weeks — that's remarkable! Remember, showing up imperfectly is infinitely better than not showing up at all. Celebrate every workout completed.",
  ],
}

export async function getAgentResponse(agentType: string, _userMessage: string, _quizData: Partial<QuizData>): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))
  const responses = mockResponses[agentType] || mockResponses.trainer
  return responses[Math.floor(Math.random() * responses.length)]
}

export { agentPersonalities }
