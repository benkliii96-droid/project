import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, returnUrl } = req.body
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!data?.stripe_customer_id) {
      return res.status(404).json({ error: 'No subscription found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: returnUrl,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[customer-portal]', err.message)
    res.status(500).json({ error: err.message })
  }
}
