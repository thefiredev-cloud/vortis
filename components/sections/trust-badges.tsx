"use client";

import { Shield, Lock, Award } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

export function TrustBadges() {
  return (
    <FadeIn delay={0.2}>
      <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 items-center py-8 opacity-70">
        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm">
          <Lock className="h-4 w-4" />
          <span>Bank-Level Security</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm">
          <Shield className="h-4 w-4" />
          <span>SOC 2 Certified</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm">
          <Award className="h-4 w-4" />
          <span>GDPR Compliant</span>
        </div>
      </div>
    </FadeIn>
  );
}
