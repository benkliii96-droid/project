/** First-month charge after coupon ($29 − $20); used when Stripe amount is unavailable. */
export const META_PURCHASE_FALLBACK_USD = 9

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function trackMetaPageView() {
  window.fbq?.('track', 'PageView')
}

export function trackMetaLead() {
  window.fbq?.('track', 'Lead')
}

export function trackMetaPurchase(value: number, currency: string) {
  window.fbq?.('track', 'Purchase', { value, currency })
}
