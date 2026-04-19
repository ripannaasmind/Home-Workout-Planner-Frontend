"use client";

import Link from "next/link";
import { Lock, Crown, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function PremiumGate({ children, feature = "this feature" }: PremiumGateProps) {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isPremium) return <>{children}</>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-700">
        <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
          {/* Icon */}
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-gray-900 border-2 border-amber-400 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>

          {/* Text */}
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-2 capitalize">
              Premium Feature
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground capitalize">{feature}</span> is available
              exclusively for premium subscribers. Unlock all features, unlimited AI workout
              generation, advanced analytics, and more.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
            {[
              { icon: "🤖", label: "AI Workouts", desc: "Unlimited generation" },
              { icon: "📅", label: "Calendar", desc: "Schedule & track" },
              { icon: "🏆", label: "Challenges", desc: "Compete & earn" },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-amber-200 dark:border-amber-800 bg-white/60 dark:bg-white/5 px-3 py-3 text-center"
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold text-foreground">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 gap-2"
            >
              <Link href="/dashboard/billing">
                <Sparkles className="h-4 w-4" />
                Upgrade to Premium
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/billing">View Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
