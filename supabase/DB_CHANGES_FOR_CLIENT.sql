-- =============================================================
-- DB CHANGES REQUIRED ON CLIENT'S SUPABASE PROJECT
-- Apply these in order via the Supabase SQL editor.
-- All statements use IF NOT EXISTS / IF EXISTS so they are
-- safe to run multiple times.
-- =============================================================


-- -------------------------------------------------------------
-- 1. SUBSCRIPTIONS TABLE — provider-agnostic payment columns
--    (replaces any Stripe-specific stripe_customer_id /
--     stripe_subscription_id columns that may have been added)
-- -------------------------------------------------------------
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_customer_id      text,  -- Paddle customer id (or other provider)
  ADD COLUMN IF NOT EXISTS payment_subscription_id  text;  -- Paddle subscription id (or other provider)


-- -------------------------------------------------------------
-- 2. QUIZ RESPONSES — new fields added in the 14-step quiz
--    Users who registered before this expansion have NULLs
--    here; the app falls back to sensible defaults in that case.
-- -------------------------------------------------------------
ALTER TABLE quiz_responses
  ADD COLUMN IF NOT EXISTS primary_motivation  text,   -- e.g. 'look_better', 'health', 'performance'
  ADD COLUMN IF NOT EXISTS previous_obstacle   text,   -- e.g. 'time', 'motivation', 'injury'
  ADD COLUMN IF NOT EXISTS session_duration    text,   -- e.g. '30_45', '45_60', '60_plus'
  ADD COLUMN IF NOT EXISTS sleep_hours         text,   -- e.g. '6_7', '7_8', '8_plus'
  ADD COLUMN IF NOT EXISTS diet_type           text,   -- e.g. 'no_restrictions', 'vegetarian', 'vegan'
  ADD COLUMN IF NOT EXISTS stress_level        text;   -- e.g. 'low', 'moderate', 'high'


-- =============================================================
-- NOTES FOR THE DEVELOPER APPLYING THESE:
--
-- • meal_plans table is NOT changed — the app now caches plans
--   in localStorage (key: fitcoach_meal_YYYY-MM-DD) so users
--   won't lose their plan on reload even if the DB write fails.
--
-- • workout_plans and workout_logs tables are unchanged.
--
-- • The Paddle webhook Edge Function (supabase/functions/
--   paddle-webhook/) must be deployed separately:
--     supabase functions deploy paddle-webhook
--   Set env vars in Supabase dashboard → Edge Functions:
--     PADDLE_WEBHOOK_SECRET  — from Paddle dashboard → Notifications
--     SUPABASE_URL           — auto-injected, no action needed
--     SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard → API
-- =============================================================
