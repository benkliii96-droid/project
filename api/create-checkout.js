import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { planId, userId, email, successUrl, cancelUrl } = req.body
  const isTrial = planId === 'trial'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      mode: isTrial ? 'payment' : 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isTrial ? 'FitCoach AI — 14-Day Trial' : 'FitCoach AI — Monthly',
              description: isTrial ? 'Full access for 14 days' : 'Full access, billed monthly',
            },
            ...(isTrial ? {} : { recurring: { interval: 'month' } }),
            unit_amount: isTrial ? 900 : 2900,
          },
          quantity: 1,
        },
      ],
      metadata: { supabase_user_id: userId, plan_id: planId },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    })
    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[create-checkout]', err.message)
    res.status(500).json({ error: err.message })
  }
}
