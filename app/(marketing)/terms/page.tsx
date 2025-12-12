import { Metadata } from 'next';
import Link from 'next/link';
import { OrbBackground } from '@/components/ui/orb-background';
import { ArrowLeft, Shield, FileText, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Vortis Terms of Service - Legal terms governing the use of our AI-powered trading intelligence platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <OrbBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-slate-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-orange-400 mb-2">
                  Important Investment Disclaimer
                </h2>
                <p className="text-orange-200/80 text-sm leading-relaxed">
                  Vortis provides financial data and AI-powered analysis for informational and
                  educational purposes only. The information provided does NOT constitute
                  investment advice, financial advice, trading advice, or any other form of
                  advice. You should not treat any of the platform&apos;s content as such. Past
                  performance does not guarantee future results. Always consult with a qualified
                  financial advisor before making any investment decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">1.</span> Acceptance of Terms
              </h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing or using Vortis (&quot;the Service&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you
                may not access the Service. These Terms apply to all visitors, users, and
                others who access or use the Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">2.</span> Description of Service
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Vortis provides AI-powered financial analysis tools including:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>SEC filing analysis (10-K, 10-Q, 8-K filings)</li>
                <li>Earnings call transcript summaries and sentiment analysis</li>
                <li>Technical indicators and chart analysis</li>
                <li>Institutional holdings tracking (13F filings)</li>
                <li>Private market research and data</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties
                of any kind, either express or implied.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">3.</span> User Accounts
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and
                current information. Failure to do so constitutes a breach of the Terms.
              </p>
              <p className="text-slate-300 leading-relaxed">
                You are responsible for safeguarding your password and for any activities or
                actions under your account. You agree not to disclose your password to any
                third party. You must notify us immediately upon becoming aware of any breach
                of security or unauthorized use of your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">4.</span> Subscription and Payments
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Some parts of the Service are billed on a subscription basis. You will be
                billed in advance on a recurring and periodic basis (monthly or annually).
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Subscription fees are non-refundable except as required by law. You may cancel
                your subscription at any time, and you will continue to have access until the
                end of your current billing period.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify our pricing at any time. Any price changes will
                be communicated to you with at least 30 days&apos; notice before taking effect.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">5.</span> Intellectual Property
              </h2>
              <p className="text-slate-300 leading-relaxed">
                The Service and its original content, features, and functionality are and will
                remain the exclusive property of Vortis and its licensors. The Service is
                protected by copyright, trademark, and other laws. Our trademarks may not be
                used in connection with any product or service without our prior written
                consent.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">6.</span> Prohibited Uses
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">You agree not to use the Service:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any regulations, rules, or laws</li>
                <li>To infringe upon or violate our intellectual property rights</li>
                <li>To harass, abuse, insult, or discriminate against others</li>
                <li>To submit false or misleading information</li>
                <li>To upload viruses or malicious code</li>
                <li>To collect or track personal information of others</li>
                <li>To spam, phish, or engage in any form of automated data collection</li>
                <li>To interfere with the security features of the Service</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">7.</span> Limitation of Liability
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                In no event shall Vortis, nor its directors, employees, partners, agents,
                suppliers, or affiliates, be liable for any indirect, incidental, special,
                consequential, or punitive damages, including without limitation, loss of
                profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                <li>Any investment decisions made based on information from the Service</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">8.</span> Indemnification
              </h2>
              <p className="text-slate-300 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Vortis and its licensees and
                licensors, and their employees, contractors, agents, officers, and directors,
                from and against any and all claims, damages, obligations, losses, liabilities,
                costs, or debt, and expenses arising from your use of and access to the
                Service, or your violation of these Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">9.</span> Governing Law
              </h2>
              <p className="text-slate-300 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the
                United States, without regard to its conflict of law provisions. Our failure
                to enforce any right or provision of these Terms will not be considered a
                waiver of those rights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">10.</span> Changes to Terms
              </h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a
                revision is material, we will try to provide at least 30 days&apos; notice prior
                to any new terms taking effect. What constitutes a material change will be
                determined at our sole discretion.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">11.</span> Contact Us
              </h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about these Terms, please contact us at{' '}
                <a
                  href="mailto:legal@vortis.io"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  legal@vortis.io
                </a>
              </p>
            </section>
          </div>

          {/* Security Badge */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Protected by enterprise-grade security</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
