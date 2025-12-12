import { Metadata } from 'next';
import Link from 'next/link';
import { OrbBackground } from '@/components/ui/orb-background';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Vortis Privacy Policy - How we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
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
              <Lock className="h-8 w-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-slate-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Privacy Commitment */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <Eye className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">
                  Our Privacy Commitment
                </h2>
                <p className="text-emerald-200/80 text-sm leading-relaxed">
                  At Vortis, we are committed to protecting your privacy. We never sell your
                  personal data to third parties. Your financial research and analysis data
                  belongs to you, and we implement bank-grade security to protect it.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">1.</span> Information We Collect
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Account Information:</strong> Name, email address, and password when
                  you create an account
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing address and payment method
                  details (processed securely by Stripe)
                </li>
                <li>
                  <strong>Usage Data:</strong> Stock tickers analyzed, watchlists created, and
                  features used
                </li>
                <li>
                  <strong>Communication Data:</strong> Information you provide when contacting
                  support
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">2.</span> Automatically Collected Information
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                When you use our Service, we automatically collect:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Device Information:</strong> Browser type, operating system, and
                  device identifiers
                </li>
                <li>
                  <strong>Log Data:</strong> IP address, access times, pages viewed, and
                  referring URLs
                </li>
                <li>
                  <strong>Cookies:</strong> Session and preference cookies (see our{' '}
                  <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300">
                    Cookie Policy
                  </Link>
                  )
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">3.</span> How We Use Your Information
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and security alerts</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">4.</span> Information Sharing
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information. We may share
                information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors who assist in
                  operating our Service (e.g., Stripe for payments, Clerk for authentication)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our
                  rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition,
                  or sale of assets
                </li>
                <li>
                  <strong>With Consent:</strong> When you give us explicit permission
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">5.</span> Data Security
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We implement robust security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>256-bit AES encryption for data at rest</li>
                <li>TLS 1.3 encryption for data in transit</li>
                <li>SOC 2 Type II compliant infrastructure</li>
                <li>Regular security audits and penetration testing</li>
                <li>Multi-factor authentication options</li>
                <li>Strict access controls and employee training</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">6.</span> Data Retention
              </h2>
              <p className="text-slate-300 leading-relaxed">
                We retain your personal information for as long as your account is active or as
                needed to provide services. We will retain and use your information as
                necessary to comply with legal obligations, resolve disputes, and enforce our
                agreements. You can request deletion of your account and associated data at any
                time.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">7.</span> Your Rights (GDPR/CCPA)
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Rectification:</strong> Correct inaccurate or incomplete data
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of your personal data
                </li>
                <li>
                  <strong>Portability:</strong> Receive your data in a portable format
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain types of processing
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of processing
                </li>
                <li>
                  <strong>Opt-out:</strong> Opt out of the sale of personal information (CCPA)
                </li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                To exercise these rights, contact us at{' '}
                <a
                  href="mailto:privacy@vortis.io"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  privacy@vortis.io
                </a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">8.</span> International Transfers
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than
                your own. We ensure appropriate safeguards are in place to protect your
                information in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">9.</span> Children&apos;s Privacy
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Our Service is not directed to individuals under 18. We do not knowingly
                collect personal information from children. If you become aware that a child
                has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">10.</span> Changes to This Policy
              </h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">11.</span> Contact Us
              </h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 bg-white/5 rounded-lg p-4">
                <p className="text-slate-300">
                  <strong className="text-white">Vortis</strong>
                  <br />
                  Email:{' '}
                  <a
                    href="mailto:privacy@vortis.io"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    privacy@vortis.io
                  </a>
                  <br />
                  Website:{' '}
                  <a
                    href="https://vortis.io"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    vortis.io
                  </a>
                </p>
              </div>
            </section>
          </div>

          {/* Security Badge */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Your privacy is protected by enterprise-grade security</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
