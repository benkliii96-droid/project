import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function getOrCreatePrice() {
  const prices = await stripe.prices.list({ active: true, limit: 100 })
  const existing = prices.data.find(
    p => p.unit_amount === 2900 && p.currency === 'usd'
      && p.recurring?.interval === 'month'
      && p.metadata?.fitcoach === 'monthly'
  )
  if (existing) return existing.id

  const product = await stripe.products.create({
    name: 'FitCoach AI — Monthly',
    description: 'Full access, billed monthly',
  })
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: 2900,
    recurring: { interval: 'month' },
    metadata: { fitcoach: 'monthly' },
  })
  return price.id
}

async function getOrCreateCoupon() {
  const coupons = await stripe.coupons.list({ limit: 100 })
  const existing = coupons.data.find(
    c => c.amount_off === 2000 && c.currency === 'usd'
      && c.duration === 'once'
      && c.metadata?.fitcoach === 'first_month'
  )
  if (existing) return existing.id

  const coupon = await stripe.coupons.create({
    amount_off: 2000,
    currency: 'usd',
    duration: 'once',
    name: '$20 off first month',
    metadata: { fitcoach: 'first_month' },
  })
  return coupon.id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, email, successUrl, cancelUrl } = req.body

  try {
    const [priceId, couponId] = await Promise.all([getOrCreatePrice(), getOrCreateCoupon()])

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: [{ coupon: couponId }],
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
      metadata: { supabase_user_id: userId },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[create-checkout]', err.message)
    res.status(500).json({ error: err.message })
  }
}
