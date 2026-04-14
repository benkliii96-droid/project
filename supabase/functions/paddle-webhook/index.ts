/**
 * Supabase Edge Function: paddle-webhook
 *
 * Receives Paddle webhook events and updates the subscriptions table.
 * Register this URL in Paddle Dashboard → Developer Tools → Notifications.
 *
 * Required Supabase secrets:
 *   PADDLE_WEBHOOK_SECRET  — secret key from Paddle notification settings
 *
 * Handled events:
 *   transaction.completed       → activate subscription
 *   subscription.canceled       → deactivate subscription
 *   subscription.past_due       → deactivate subscription
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paddle-signature',
}

/** Verify Paddle webhook signature (HMAC-SHA256) */
async function verifySignature(body: string, signatureHeader: string): Promise<boolean> {
  const secret = Deno.env.get('PADDLE_WEBHOOK_SECRET') ?? ''
  if (!secret) return true // skip in dev if secret not set

  // Paddle signature format: ts=<timestamp>;h1=<hash>
  const parts = Object.fromEntries(
    signatureHeader.split(';').map(p => p.split('=') as [string, string]),
  )
  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false

  const payload = `${ts}:${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === h1
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const body = await req.text()
  const signature = req.headers.get('paddle-signature') ?? ''

  if (!(await verifySignature(body, signature))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let event: { event_type: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  switch (event.event_type) {
    case 'transaction.completed': {
      const data = event.data as {
        customer_id?: string
        subscription_id?: string
        custom_data?: { supabase_user_id?: string; plan_id?: string }
      }
      const userId = data.custom_data?.supabase_user_id
      const planId = data.custom_data?.plan_id ?? 'trial'
      if (!userId) break

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: planId,
        status: 'active',
        payment_customer_id: data.customer_id ?? null,
        payment_subscription_id: data.subscription_id ?? null,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'subscription.canceled':
    case 'subscription.past_due': {
      const data = event.data as { custom_data?: { supabase_user_id?: string } }
      const userId = data.custom_data?.supabase_user_id
      if (!userId) break

      await supabase
        .from('subscriptions')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
