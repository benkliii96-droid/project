/**
 * Payment provider abstraction layer.
 *
 * To swap to a different payment provider:
 *  1. Implement the `PaymentProvider` interface below.
 *  2. Replace `new PaddleProvider()` at the bottom with your new class.
 *
 * The rest of the app (SubscriptionPage, PaymentSuccessPage) stays untouched.
 */

import { initializePaddle, type Paddle } from '@paddle/paddle-js'

export type PlanId = 'trial' | 'premium'

export interface CheckoutResult {
  /** If provided, redirect the browser here. If null, checkout opened as overlay. */
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

// ── Paddle Billing implementation ──────────────────────────────────────────
// Paddle opens a hosted overlay on the page — no backend call required.
// Env vars needed (add to .env):
//   VITE_PADDLE_TOKEN        — client-side token (starts with live_ or test_)
//   VITE_PADDLE_TRIAL_PRICE  — Paddle Price ID for $9 trial  (pri_...)
//   VITE_PADDLE_MONTHLY_PRICE— Paddle Price ID for $29/month (pri_...)
//   VITE_PADDLE_ENV          — "production" | "sandbox" (default: sandbox)

let paddleInstance: Paddle | null = null

async function getPaddle(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance
  const paddle = await initializePaddle({
    environment: (import.meta.env.VITE_PADDLE_ENV ?? 'sandbox') as 'production' | 'sandbox',
    token: import.meta.env.VITE_PADDLE_TOKEN ?? '',
  })
  if (!paddle) throw new Error('Failed to initialize Paddle')
  paddleInstance = paddle
  return paddleInstance
}

class PaddleProvider implements PaymentProvider {
  async createCheckout(opts: {
    planId: PlanId
    userId: string
    email: string
    successUrl: string
    cancelUrl: string
  }): Promise<CheckoutResult> {
    const priceId =
      opts.planId === 'trial'
        ? import.meta.env.VITE_PADDLE_TRIAL_PRICE
        : import.meta.env.VITE_PADDLE_MONTHLY_PRICE

    if (!priceId) {
      throw new Error(
        `VITE_PADDLE_${opts.planId === 'trial' ? 'TRIAL' : 'MONTHLY'}_PRICE is not set in .env`,
      )
    }

    const paddle = await getPaddle()

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: opts.email },
      customData: { supabase_user_id: opts.userId, plan_id: opts.planId },
      settings: {
        successUrl: opts.successUrl,
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'en',
      },
    })

    // Overlay opened — no redirect URL to return
    return { url: null }
  }
}

// ── Active provider — change this line to swap payment providers ───────────

const provider: PaymentProvider = new PaddleProvider()

export const payments = {
  createCheckout: (opts: Parameters<PaymentProvider['createCheckout']>[0]) =>
    provider.createCheckout(opts),
}
