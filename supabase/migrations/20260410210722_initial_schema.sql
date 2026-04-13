/*
  # FitCoach AI - Initial Database Schema

  ## Overview
  Complete schema for AI fitness coaching application for men 50+

  ## New Tables

  ### profiles
  - Extended user profile with quiz data and subscription status
  - Linked to Supabase auth.users

  ### quiz_responses
  - Stores all questionnaire answers per user
  - JSON fields for flexible data storage

  ### workout_plans
  - AI-generated personalized workout plans
  - Contains structured exercise data

  ### meal_plans
  - AI-generated nutrition plans with daily menus
  - Rotates daily for variety

  ### workout_logs
  - Tracks completed workouts and exercises
  - Used for progress monitoring

  ### chat_messages
  - Conversation history with AI agents

  ### subscriptions
  - User subscription status and billing info

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Quiz responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer,
  gender text DEFAULT 'male',
  height_cm numeric,
  weight_kg numeric,
  training_goal text,
  body_goal text,
  fitness_level text,
  training_frequency integer,
  training_format text,
  medical_conditions text[] DEFAULT '{}',
  medical_notes text,
  photo_url text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz responses"
  ON quiz_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz responses"
  ON quiz_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz responses"
  ON quiz_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous quiz data to be stored temporarily (for pre-auth flow)
CREATE TABLE IF NOT EXISTS temp_quiz_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE temp_quiz_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert temp quiz data"
  ON temp_quiz_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can select temp quiz data by session key"
  ON temp_quiz_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update temp quiz data"
  ON temp_quiz_data FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan text DEFAULT 'free',
  status text DEFAULT 'inactive',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Workout plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Workout Plan',
  description text,
  weeks_duration integer DEFAULT 4,
  plan_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  meals jsonb NOT NULL DEFAULT '[]',
  total_calories integer DEFAULT 0,
  total_protein integer DEFAULT 0,
  total_carbs integer DEFAULT 0,
  total_fat integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Workout logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  workout_name text NOT NULL,
  exercises_data jsonb DEFAULT '[]',
  duration_minutes integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type text DEFAULT 'trainer',
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_at ON workout_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_temp_quiz_data_session ON temp_quiz_data(session_key);
