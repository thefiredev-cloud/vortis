"use client";

import { useState } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";

const faqs = [
  {
    question: "What's included in the free trial?",
    answer:
      "Get 1 free stock analysis with full access to our SEC filing insights, technical indicators, and earnings transcript analysis. No credit card required.",
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer:
      "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we'll prorate any charges.",
  },
  {
    question: "What data sources do you use?",
    answer:
      "We aggregate data from official SEC filings (10-K, 10-Q, 8-K), earnings call transcripts, institutional holdings (13F filings), real-time market data, and private company databases covering 3M+ companies and 500k+ funding rounds.",
  },
  {
    question: "How accurate is the analysis?",
    answer:
      "Our analysis is powered by institutional-grade data and advanced algorithms that process 10 years of historical financial data. While we provide comprehensive insights, all trading decisions should be made at your own discretion.",
  },
  {
    question: "Do you offer API access?",
    answer:
      "Yes! API access is available with our Enterprise plan, allowing you to integrate Vortis data directly into your own applications with unlimited API calls.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and process payments securely through Stripe. All transactions are encrypted and PCI compliant.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20 border-t border-white/10">
      <div className="container mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            <GradientText>Frequently Asked Questions</GradientText>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left touch-manipulation"
                >
                  <span className="text-white font-semibold text-sm md:text-base pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 text-slate-400 text-sm md:text-base">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
