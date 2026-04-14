import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a15] text-slate-300 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-2">When you use FitCoach AI, we collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-300">Account data:</strong> email address, full name, password (hashed).</li>
              <li><strong className="text-slate-300">Health & fitness data:</strong> age, gender, height, weight, fitness goals, training preferences, and medical notes you provide during onboarding.</li>
              <li><strong className="text-slate-300">Usage data:</strong> workout logs, meal plan history, app activity.</li>
              <li><strong className="text-slate-300">Payment data:</strong> subscription status. Payment details are processed by our payment provider and are not stored on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>To generate personalised workout and nutrition plans.</li>
              <li>To provide AI coaching responses tailored to your profile.</li>
              <li>To track your progress and display statistics.</li>
              <li>To process subscription payments.</li>
              <li>To improve and maintain the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Data Storage</h2>
            <p>Your data is stored securely using Supabase infrastructure with industry-standard encryption at rest and in transit. Health and fitness data you provide is stored only to personalise your experience and is not sold to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-300">OpenAI</strong> — AI plan generation. Your profile data is sent to OpenAI's API to generate plans. OpenAI's privacy policy applies.</li>
              <li><strong className="text-slate-300">Paddle</strong> — payment processing. Your payment information is handled by Paddle and not stored by us.</li>
              <li><strong className="text-slate-300">Supabase</strong> — database and authentication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>You may request access to or deletion of your personal data at any time.</li>
              <li>You may update your profile information through the app settings.</li>
              <li>To request full data deletion, contact us at the email below.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Cookies & Local Storage</h2>
            <p>We use browser local storage to cache your plan data for faster load times and offline resilience. No tracking cookies are used for advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Children's Privacy</h2>
            <p>The Service is not intended for users under the age of 18. We do not knowingly collect personal data from minors.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Contact</h2>
            <p>For privacy-related requests or questions, contact us at <span className="text-brand-400">support@fitcoachai.app</span>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
