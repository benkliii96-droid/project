# Supabase Edge Functions — Setup

## Payment integration (Paddle)

### 1. Paddle Dashboard — create products

1. Go to https://vendors.paddle.com/products
2. Create product **"FitCoach AI Trial"** → price **$9.00 one-time** → copy `pri_...`
3. Create product **"FitCoach AI Monthly"** → price **$29.00 / month (recurring)** → copy `pri_...`
4. In **Developer Tools → Authentication** copy your **Client-side token** (`test_...` or `live_...`)

### 2. Add keys to `.env` (local dev)

```env
VITE_PADDLE_TOKEN=test_...
VITE_PADDLE_ENV=sandbox
VITE_PADDLE_TRIAL_PRICE=pri_...
VITE_PADDLE_MONTHLY_PRICE=pri_...
```

### 3. Set Supabase secrets (for webhook)

```bash
supabase secrets set PADDLE_WEBHOOK_SECRET=<from Paddle notification settings>
```

### 4. Deploy Edge Function

```bash
supabase functions deploy paddle-webhook --no-verify-jwt
```

### 5. Register Paddle webhook

1. Go to Paddle Dashboard → **Developer Tools → Notifications**
2. Add endpoint: `https://<your-project>.supabase.co/functions/v1/paddle-webhook`
3. Select events:
   - `transaction.completed`
   - `subscription.canceled`
   - `subscription.past_due`
4. Copy **Secret key** → paste as `PADDLE_WEBHOOK_SECRET` above

### 6. Run DB migration

```bash
supabase db push
```

---


---

## Swapping to a different payment provider

All payment logic is in `src/lib/payments.ts`.

1. Implement the `PaymentProvider` interface.
2. Replace `new PaddleProvider()` at the bottom of `payments.ts`.
3. Create a new Edge Function (or point to your backend) for webhooks.

The rest of the app requires no changes.
