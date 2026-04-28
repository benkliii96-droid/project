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

    // Webhook handles DB write — just confirm payment is good
    res.status(200).json({ paid: true })
  } catch (err) {
    console.error('[verify-payment]', err.message)
    res.status(500).json({ error: err.message })
  }
}
