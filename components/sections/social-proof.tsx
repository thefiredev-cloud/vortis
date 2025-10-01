"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function SocialProof() {
  return (
    <section className="py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="touch-manipulation">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                <AnimatedCounter value={10000} suffix="+" />
              </div>
              <p className="text-slate-400 text-sm md:text-base">Analyses Run Daily</p>
            </div>
            <div className="touch-manipulation">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                <AnimatedCounter value={95} suffix="%" />
              </div>
              <p className="text-slate-400 text-sm md:text-base">User Satisfaction Rate</p>
            </div>
            <div className="touch-manipulation">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                $<AnimatedCounter value={500} suffix="M+" />
              </div>
              <p className="text-slate-400 text-sm md:text-base">in Assets Tracked</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
