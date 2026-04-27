import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { planId, userId, email, successUrl, cancelUrl } = req.body
  const isRenewal = planId === 'monthly'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isRenewal ? 'FitCoach AI — 30-Day Access' : 'FitCoach AI — 14-Day Access',
              description: isRenewal
                ? 'Full access to your personalized AI fitness program for 30 days'
                : 'Full access to your personalized AI fitness program for 14 days',
            },
            unit_amount: isRenewal ? 2900 : 900,
          },
          quantity: 1,
        },
      ],
      metadata: { supabase_user_id: userId, plan_id: planId ?? 'trial' },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    })
    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[create-checkout]', err.message)
    res.status(500).json({ error: err.message })
  }
}
