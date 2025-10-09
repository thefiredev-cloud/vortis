"use client";

import { useState } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const faqs = [
  {
    id: "faq-free-trial",
    question: "What's included in the free trial?",
    answer:
      "Get 1 free stock analysis with full access to our SEC filing insights, technical indicators, and earnings transcript analysis. No credit card required.",
  },
  {
    id: "faq-plan-changes",
    question: "Can I upgrade or downgrade my plan anytime?",
    answer:
      "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we'll prorate any charges.",
  },
  {
    id: "faq-data-sources",
    question: "What data sources do you use?",
    answer:
      "We aggregate data from official SEC filings (10-K, 10-Q, 8-K), earnings call transcripts, institutional holdings (13F filings), real-time market data, and private company databases covering 3M+ companies and 500k+ funding rounds.",
  },
  {
    id: "faq-accuracy",
    question: "How accurate is the analysis?",
    answer:
      "Our analysis is powered by institutional-grade data and advanced algorithms that process 10 years of historical financial data. While we provide comprehensive insights, all trading decisions should be made at your own discretion.",
  },
  {
    id: "faq-api-access",
    question: "Do you offer API access?",
    answer:
      "Yes! API access is available with our Enterprise plan, allowing you to integrate Vortis data directly into your own applications with unlimited API calls.",
  },
  {
    id: "faq-payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and process payments securely through Stripe. All transactions are encrypted and PCI compliant.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <section className="py-16 md:py-20 border-t border-white/10">
      <div className="container mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            <GradientText>Frequently Asked Questions</GradientText>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left touch-manipulation"
                >
                  <span className="text-white font-semibold text-sm md:text-base pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={openIndex === faq.id ? "faq-chevron-open" : "faq-chevron-closed"}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
                </button>
                {openIndex === faq.id && (
                  <div className="faq-content-open">
                    <div className="px-6 pb-4 text-slate-400 text-sm md:text-base">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
