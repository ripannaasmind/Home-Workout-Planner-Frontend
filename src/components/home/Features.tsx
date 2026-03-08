"use client";

import { CheckCircle, TrendingUp, Trophy, RefreshCw } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Custom Workout Plans",
    description: "Personalized routines tailored to your goals",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Monitor your improvements over time",
  },
  {
    icon: Trophy,
    title: "Achieve Milestones",
    description: "Earn badges and celebrate your wins",
  },
  {
    icon: RefreshCw,
    title: "Sync Across Devices",
    description: "Access your workouts anywhere",
  },
];

export function Features() {
  return (
    <section id="features" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Why Choose FitHome?
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm md:text-base max-w-md mx-auto">
            Tailored fitness programs curated to meet your goals
          </p>
        </div>

        {}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 card-hover"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-1 sm:mb-2 line-clamp-2">
                {feature.title}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-text-muted leading-relaxed hidden sm:block">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
