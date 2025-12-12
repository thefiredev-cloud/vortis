import { Metadata } from 'next';
import Link from 'next/link';
import { OrbBackground } from '@/components/ui/orb-background';
import { ArrowLeft, Shield, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Vortis Cookie Policy - Information about how we use cookies and similar technologies.',
};

export default function CookiesPage() {
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
              <Cookie className="h-8 w-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
            </div>
            <p className="text-slate-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">1.</span> What Are Cookies?
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device
                when you visit a website. They are widely used to make websites work more
                efficiently and to provide information to website owners. Cookies help us
                recognize your device and remember certain information about your visit.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">2.</span> How We Use Cookies
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Vortis uses cookies and similar technologies for several purposes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>To enable core functionality and security features</li>
                <li>To remember your preferences and settings</li>
                <li>To authenticate your account and keep you logged in</li>
                <li>To understand how you use our Service</li>
                <li>To improve our Service based on usage patterns</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">3.</span> Types of Cookies We Use
              </h2>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                    Essential Cookies (Required)
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    These cookies are necessary for the website to function and cannot be
                    disabled. They are usually set in response to actions you take, such as
                    logging in or filling out forms. They include authentication tokens and
                    security cookies.
                  </p>
                  <div className="mt-3 text-xs text-slate-400">
                    Examples: __clerk_session, __stripe_mid
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    These cookies enable enhanced functionality and personalization, such as
                    remembering your preferences, language settings, and display options.
                  </p>
                  <div className="mt-3 text-xs text-slate-400">
                    Examples: theme_preference, dashboard_layout
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    These cookies help us understand how visitors interact with our website by
                    collecting and reporting information anonymously. This helps us improve our
                    Service.
                  </p>
                  <div className="mt-3 text-xs text-slate-400">
                    Examples: _ga, _gid (Google Analytics if enabled)
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">4.</span> Third-Party Cookies
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Some cookies are placed by third-party services that appear on our pages:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-white font-semibold">Provider</th>
                      <th className="text-left py-3 text-white font-semibold">Purpose</th>
                      <th className="text-left py-3 text-white font-semibold">Privacy Policy</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-white/5">
                      <td className="py-3">Clerk</td>
                      <td className="py-3">Authentication</td>
                      <td className="py-3">
                        <a
                          href="https://clerk.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          View Policy
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3">Stripe</td>
                      <td className="py-3">Payment Processing</td>
                      <td className="py-3">
                        <a
                          href="https://stripe.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          View Policy
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3">Supabase</td>
                      <td className="py-3">Database Services</td>
                      <td className="py-3">
                        <a
                          href="https://supabase.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          View Policy
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">5.</span> Managing Cookies
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Browser Settings:</strong> Most browsers allow you to refuse or
                  accept cookies, delete cookies, or be notified when a cookie is set
                </li>
                <li>
                  <strong>Cookie Consent:</strong> When you first visit our site, you can
                  choose which types of cookies to accept
                </li>
                <li>
                  <strong>Opt-Out Links:</strong> Many analytics providers offer opt-out
                  mechanisms
                </li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong className="text-white">Note:</strong> Disabling essential cookies may
                affect the functionality of our Service. You may not be able to log in or use
                certain features if essential cookies are blocked.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">6.</span> Cookie Retention
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Different cookies have different retention periods:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Session Cookies:</strong> Deleted when you close your browser
                </li>
                <li>
                  <strong>Persistent Cookies:</strong> Remain until their expiration date or
                  until you delete them (typically 30 days to 2 years)
                </li>
                <li>
                  <strong>Authentication Cookies:</strong> Typically 7-30 days, depending on
                  your &quot;remember me&quot; selection
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">7.</span> Updates to This Policy
              </h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our
                practices or for other operational, legal, or regulatory reasons. We encourage
                you to periodically review this page for the latest information on our cookie
                practices.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">8.</span> Contact Us
              </h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions about our use of cookies, please contact us at{' '}
                <a
                  href="mailto:privacy@vortis.io"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  privacy@vortis.io
                </a>
              </p>
            </section>
          </div>

          {/* Related Links */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Related Policies</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 pt-8 border-t border-white/10">
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
