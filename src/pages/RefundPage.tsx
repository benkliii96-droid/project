import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a15] text-slate-300 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Refund Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">7-Day Money-Back Guarantee</h2>
            <p>If you are not satisfied with FitCoach AI within the first <strong className="text-white">7 days</strong> of your initial subscription, you may request a full refund — no questions asked. Refund requests after 7 days will be reviewed on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">How to Request a Refund</h2>
            <p>To request a refund, contact us at <span className="text-brand-400">support@fitcoachai.app</span> with the subject line "Refund Request" and include the email address associated with your account. We will process eligible refunds within <strong className="text-white">5–10 business days</strong>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">Cancellation</h2>
            <p>You may cancel your subscription at any time through your account settings or by contacting support. Cancellation stops future charges but does not automatically trigger a refund for the current billing period unless you are within the 7-day guarantee window.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">Non-Refundable Cases</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Refund requests made more than 7 days after the initial purchase (unless exceptional circumstances apply).</li>
              <li>Renewals where the subscription was not cancelled before the renewal date.</li>
              <li>Accounts found to be in violation of our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">Contact</h2>
            <p>For any questions about refunds, please reach out to <span className="text-brand-400">support@fitcoachai.app</span>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
