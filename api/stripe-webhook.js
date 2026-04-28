import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] signature error:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const obj = event.data.object

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        // Subscription activated after first payment
        if (obj.mode !== 'subscription') break
        const userId = obj.metadata?.supabase_user_id
        if (!userId) break
        const sub = await stripe.subscriptions.retrieve(obj.subscription)
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan: 'monthly',
          status: 'active',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_customer_id: String(sub.customer),
          stripe_subscription_id: sub.id,
        }, { onConflict: 'user_id' })
        break
      }

      case 'invoice.payment_succeeded': {
        // Recurring monthly renewal
        if (!obj.subscription) break
        const sub = await stripe.subscriptions.retrieve(obj.subscription)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan: 'monthly',
          status: 'active',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_customer_id: String(sub.customer),
          stripe_subscription_id: sub.id,
        }, { onConflict: 'user_id' })
        break
      }

      case 'customer.subscription.deleted': {
        // User cancelled or payment failed too many times
        await supabase.from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', obj.id)
        break
      }

      case 'invoice.payment_failed': {
        // Payment failed — mark as past_due, Stripe will retry
        if (!obj.subscription) break
        await supabase.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', obj.subscription)
        break
      }
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err.message)
    return res.status(500).json({ error: err.message })
  }

  res.status(200).json({ received: true })
}
