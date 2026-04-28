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
    const paid = session.payment_status === 'paid' || !!session.subscription

    if (!paid) return res.status(200).json({ paid: false })

    const userId = session.metadata?.supabase_user_id
    if (userId && session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription)
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: 'monthly',
        status: 'active',
        current_period_end: periodEnd,
        stripe_customer_id: String(sub.customer),
        stripe_subscription_id: sub.id,
      }, { onConflict: 'user_id' })
    }

    res.status(200).json({ paid: true })
  } catch (err) {
    console.error('[verify-payment]', err.message)
    res.status(500).json({ error: err.message })
  }
}
