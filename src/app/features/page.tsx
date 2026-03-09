"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTA } from "@/components/home/CTA";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  TrendingUp,
  Trophy,
  RefreshCw,
  Dumbbell,
  Activity,
  Flame,
  Star,
  Zap,
  Heart,
  Shield,
  Target,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { featuresApi, Feature } from "@/services/api";

const ICON_MAP: Record<string, React.ElementType> = {
  CheckCircle, TrendingUp, Trophy, RefreshCw, Dumbbell,
  Activity, Flame, Star, Zap, Heart, Shield, Target,
};

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? CheckCircle;
  return <Icon className={className} />;
}

const FALLBACK_FEATURES: Omit<Feature, "_id" | "createdAt">[] = [
  {
    title: "Custom Tailored Workouts",
    description: "FitHome creates personalized workout plans based on your goals, fitness level, and schedule. Whether you want to lose weight, build muscle, or increase endurance, we've got the perfect plan for you.",
    image: "https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=800&h=600&fit=crop",
    imageAlt: "Woman doing kettlebell workout", icon: "Dumbbell", order: 0, isActive: true, reverse: false,
  },
  {
    title: "Detailed Progress Tracking",
    description: "Track your workout performance with detailed analytics. Monitor calories burned, workout history, strength progress, and more with easy-to-read charts.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop",
    imageAlt: "Athlete tracking progress on phone while running", icon: "TrendingUp", order: 1, isActive: true, reverse: true,
  },
  {
    title: "Achieve Milestones & Stay Motivated",
    description: "Set milestones and celebrate your achievements! Earn badges, beat personal records, and stay motivated with progress reminders and celebrations.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop",
    imageAlt: "People celebrating fitness achievements", icon: "Trophy", order: 2, isActive: true, reverse: false,
  },
  {
    title: "Sync Workout Data Everywhere",
    description: "Access your workouts and progress on any device—smartphone, tablet or computer. Sync seamlessly across all your devices for convenience and continuity.",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=600&fit=crop",
    imageAlt: "Person using smartwatch for fitness tracking", icon: "RefreshCw", order: 3, isActive: true, reverse: true,
  },
];

const PILL_GRADIENTS = [
  "from-primary/80 to-primary",
  "from-blue-500/80 to-blue-600",
  "from-purple-500/80 to-purple-600",
  "from-orange-500/80 to-orange-600",
];

type AnyFeature = Feature | (Omit<Feature, "_id" | "createdAt"> & { _id?: string });

function FeatureCard({ feature, index }: { feature: AnyFeature; index: number }) {
  const isReversed = feature.reverse;
  const gradient = PILL_GRADIENTS[index % PILL_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
    >
      {/* Text side */}
      <div className={`flex flex-col gap-5 text-center lg:text-left ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
        <div className="flex items-center gap-3 justify-center lg:justify-start">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br ${gradient} text-white font-bold text-sm shadow-md`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 max-w-15 bg-linear-to-r from-primary/40 to-transparent" />
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
          {feature.title}
        </h3>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0">
          {feature.description}
        </p>
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <FeatureIcon name={feature.icon} className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">{feature.icon}</span>
          </div>
        </div>
        <div className="flex justify-center lg:justify-start">
          <Link href="/login">
            <Button size="sm" className="bg-primary hover:bg-primary-dark text-white gap-2 rounded-full px-5">
              Get Started <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Image side */}
      <div className={`relative ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
        <div className="relative mx-auto max-w-105 lg:max-w-none">
          <div className={`absolute -top-6 -right-4 w-36 h-36 rounded-full bg-linear-to-br ${gradient} opacity-10 blur-2xl pointer-events-none`} />
          <div className="absolute -bottom-6 -left-4 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 aspect-4/3">
            {feature.image ? (
              <SafeImage
                src={feature.image}
                alt={feature.imageAlt || feature.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/10 via-primary/5 to-background flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <FeatureIcon name={feature.icon} className="w-10 h-10 text-primary/70" />
                </div>
                <span className="text-xs text-text-muted">Upload image from Admin → Features Page</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r ${gradient} text-white text-xs font-semibold shadow-lg`}>
                <FeatureIcon name={feature.icon} className="w-3.5 h-3.5" />
                {feature.title.split(" ").slice(0, 3).join(" ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<AnyFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    featuresApi
      .getPublic()
      .then((res) => {
        setFeatures(res.data.length > 0 ? res.data : FALLBACK_FEATURES);
      })
      .catch(() => setFeatures(FALLBACK_FEATURES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-primary/5 py-14 sm:py-20 lg:py-28">
          <div className="absolute inset-0 gym-pattern pointer-events-none opacity-40" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Platform Features</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
                Everything You Need to{" "}
                <span className="text-gradient-green">Transform</span> Your Body
              </h1>
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-8">
                FitHome brings together powerful workout tools, real-time analytics, and motivation systems—all under one roof. Your fitness journey, elevated.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-white gap-2 rounded-full px-8 w-full sm:w-auto">
                    Start for Free <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/workouts">
                  <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 w-full sm:w-auto border-primary/30 hover:bg-primary/10">
                    Browse Workouts
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-14 sm:py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-20 sm:space-y-28 lg:space-y-36">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={"_id" in feature && feature._id ? feature._id : String(index)}
                    feature={feature}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-12 sm:py-16 bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { value: "50K+", label: "Active Users" },
                { value: "2M+", label: "Workouts Logged" },
                { value: "500M+", label: "Calories Burned" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
