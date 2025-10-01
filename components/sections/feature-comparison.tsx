"use client";

import { Check, X } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";

const features = [
  {
    name: "Monthly Analyses",
    starter: "100",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    name: "SEC Filing History",
    starter: "2 years",
    pro: "10 years",
    enterprise: "10 years",
  },
  {
    name: "Technical Indicators",
    starter: "5",
    pro: "20+",
    enterprise: "20+",
  },
  {
    name: "Earnings Transcripts",
    starter: false,
    pro: true,
    enterprise: true,
  },
  {
    name: "13F Holdings Tracking",
    starter: false,
    pro: true,
    enterprise: true,
  },
  {
    name: "Private Company Data",
    starter: false,
    pro: false,
    enterprise: "3M+ companies",
  },
  {
    name: "Funding Round Tracking",
    starter: false,
    pro: false,
    enterprise: "500k+ deals",
  },
  {
    name: "M&A Transaction Database",
    starter: false,
    pro: false,
    enterprise: "2M+ deals",
  },
  {
    name: "API Access",
    starter: false,
    pro: false,
    enterprise: "Unlimited",
  },
  {
    name: "Support",
    starter: "Email",
    pro: "24/7 Priority",
    enterprise: "Dedicated Manager",
  },
];

export function FeatureComparison() {
  return (
    <section className="mt-16 md:mt-20">
      <FadeIn>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          <GradientText>Compare Plans</GradientText>
        </h2>
        <div className="overflow-x-auto -mx-6 px-6 pb-4">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 pr-4 text-slate-400 font-semibold text-sm md:text-base">
                  Feature
                </th>
                <th className="pb-4 px-2 md:px-4 text-center text-slate-400 font-semibold text-sm md:text-base">
                  Starter
                </th>
                <th className="pb-4 px-2 md:px-4 text-center text-emerald-400 font-semibold text-sm md:text-base">
                  Pro
                </th>
                <th className="pb-4 pl-2 md:pl-4 text-center text-purple-400 font-semibold text-sm md:text-base">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr
                  key={feature.name}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors touch-manipulation"
                >
                  <td className="py-3 md:py-4 pr-4 text-slate-300 text-sm md:text-base">
                    {feature.name}
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-center text-sm md:text-base">
                    {typeof feature.starter === "boolean" ? (
                      feature.starter ? (
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 md:h-5 md:w-5 text-slate-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-slate-400">{feature.starter}</span>
                    )}
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-center text-sm md:text-base">
                    {typeof feature.pro === "boolean" ? (
                      feature.pro ? (
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 md:h-5 md:w-5 text-slate-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        {feature.pro}
                      </span>
                    )}
                  </td>
                  <td className="py-3 md:py-4 pl-2 md:pl-4 text-center text-sm md:text-base">
                    {typeof feature.enterprise === "boolean" ? (
                      feature.enterprise ? (
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-purple-400 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 md:h-5 md:w-5 text-slate-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-purple-400 font-medium">
                        {feature.enterprise}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </section>
  );
}
