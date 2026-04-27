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

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    const paid = session.payment_status === 'paid'

    if (!paid) return res.status(200).json({ paid: false })

    const userId = session.metadata?.supabase_user_id
    const planId = session.metadata?.plan_id ?? 'trial'
    const days = planId === 'monthly' ? 30 : 14

    if (userId) {
      const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: planId,
          status: 'active',
          trial_ends_at: periodEnd,
          current_period_end: periodEnd,
        }, { onConflict: 'user_id' })

      if (upsertError) {
        console.error('[verify-payment] upsert error:', upsertError.message)
        return res.status(500).json({ error: 'Failed to activate: ' + upsertError.message })
      }
    }

    res.status(200).json({ paid: true, userId })
  } catch (err) {
    console.error('[verify-payment]', err.message)
    res.status(500).json({ error: err.message })
  }
}
