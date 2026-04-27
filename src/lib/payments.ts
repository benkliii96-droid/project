export type PlanId = 'trial' | 'premium' | 'monthly'

export interface CheckoutResult {
  url: string | null
}

export interface PaymentProvider {
  createCheckout(opts: {
    planId: PlanId
    userId: string
    email: string
    successUrl: string
    cancelUrl: string
  }): Promise<CheckoutResult>
}

class StripeProvider implements PaymentProvider {
  async createCheckout(opts: {
    planId: PlanId
    userId: string
    email: string
    successUrl: string
    cancelUrl: string
  }): Promise<CheckoutResult> {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    })
    if (!res.ok) throw new Error('Failed to create checkout session')
    const { url } = await res.json()
    return { url }
  }
}

const provider: PaymentProvider = new StripeProvider()

export const payments = {
  createCheckout: (opts: Parameters<PaymentProvider['createCheckout']>[0]) =>
    provider.createCheckout(opts),
}
