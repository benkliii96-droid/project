import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { session_id } = req.query
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' })

  const session = await stripe.checkout.sessions.retrieve(session_id)

  const paid =
    session.payment_status === 'paid' ||
    (session.mode === 'subscription' && !!session.subscription)

  if (!paid) return res.status(200).json({ paid: false })

  const userId = session.metadata?.supabase_user_id
  const planId = session.metadata?.plan_id ?? 'trial'

  if (userId) {
    const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: planId,
      status: 'active',
      trial_ends_at: planId === 'trial' ? trialEnds : null,
      current_period_end: periodEnd,
      stripe_session_id: session_id,
    })
  }

  res.status(200).json({ paid: true, userId, planId })
}
