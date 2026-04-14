import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a15] text-slate-300 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using FitCoach AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Description of Service</h2>
            <p>FitCoach AI provides AI-generated fitness plans, nutrition guidance, and workout tracking tools. The Service is intended for informational and motivational purposes only.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Medical Disclaimer</h2>
            <p className="text-yellow-400/90">This service does not provide medical advice. All content, including workout plans, nutrition recommendations, and AI-generated guidance, is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare professional before starting any fitness or nutrition program, especially if you have existing health conditions.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You agree not to misuse the Service or use it for any unlawful purpose.</li>
              <li>You are solely responsible for any health decisions made based on content from the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Subscriptions & Payments</h2>
            <p>Certain features of the Service require a paid subscription. By subscribing, you agree to pay the applicable fees. Subscriptions automatically renew unless cancelled before the renewal date. Please refer to our Refund Policy for information on cancellations and refunds.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service — including but not limited to AI-generated plans, text, graphics, and software — are owned by FitCoach AI and are protected by applicable intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>FitCoach AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including any injuries or health issues resulting from following AI-generated fitness or nutrition recommendations.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Contact</h2>
            <p>For questions regarding these Terms, please contact us at <span className="text-brand-400">support@fitcoachai.app</span>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
