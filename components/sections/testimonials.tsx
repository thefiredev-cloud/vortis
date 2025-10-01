"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";
import { AnimatedCard } from "@/components/ui/animated-card";

const testimonials = [
  {
    id: "testimonial-michael",
    quote: "Vortis has completely changed how I analyze stocks. What used to take hours now takes seconds. The SEC filing insights are incredible.",
    name: "Michael Chen",
    role: "Day Trader",
    gradient: "from-emerald-400 to-cyan-400",
  },
  {
    id: "testimonial-sarah",
    quote: "The earnings transcript analysis saved me from a bad investment. I found red flags in management tone that I would have missed otherwise.",
    name: "Sarah Martinez",
    role: "Portfolio Manager",
    gradient: "from-cyan-400 to-blue-400",
  },
  {
    id: "testimonial-james",
    quote: "As a professional trader, having access to 10 years of data and 20+ technical indicators in one platform is a game-changer. Worth every penny.",
    name: "James Anderson",
    role: "Hedge Fund Analyst",
    gradient: "from-purple-400 to-pink-400",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 border-t border-white/10">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
          <GradientText>Trusted by Traders</GradientText>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <AnimatedCard key={testimonial.id} delay={0.1 * idx}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 h-full touch-manipulation hover:border-white/20 transition-all active:scale-[0.98]">
                <p className="text-slate-300 mb-6 text-sm md:text-base leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex-shrink-0`}
                  />
                  <div>
                    <p className="text-white font-semibold text-sm md:text-base">
                      {testimonial.name}
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
