"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTA } from "@/components/home/CTA";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Trophy, RefreshCw, Play, Dumbbell, Activity, Flame, User, Medal, Crown, Award } from "lucide-react";

const featureCards = [
  {
    id: 1,
    icon: CheckCircle,
    title: "Custom Tailored Workouts",
    description: "FitHome creates personalized workout plans based on your goals, fitness level, and schedule. Whether you want to lose weight, build muscle, or increase endurance, we've got the perfect plan for you.",
    featureIcon: Dumbbell,
    imageAlt: "Custom workout interface",
    reverse: false,
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Detailed Progress Tracking",
    description: "Track your workout performance with detailed analytics. Monitor your calories burned, workout history, strength progress, and more with easy-to-read charts.",
    featureIcon: TrendingUp,
    imageAlt: "Stats dashboard on multiple devices",
    reverse: true,
  },
  {
    id: 3,
    icon: Trophy,
    title: "Achieve Milestones & Stay Motivated",
    description: "Set milestones and celebrate your achievements! Earn badges, beat personal records, and stay motivated with progress reminders and celebrations.",
    featureIcon: Trophy,
    imageAlt: "Achievement badges",
    reverse: false,
    badges: [
      { icon: Medal, title: "5 Workouts Complete", subtitle: "Super Stretching" },
      { icon: Crown, title: "First Week Done", subtitle: "Great beginning" },
      { icon: Award, title: "First Month Complete", subtitle: "Super Workout Routine" },
    ],
  },
  {
    id: 4,
    icon: RefreshCw,
    title: "Sync Workout Data Everywhere",
    description: "Access your workouts and progress on any device—whether it's your smartphone, tablet or computer. Sync seamlessly across all your devices for convenience and continuity.",
    featureIcon: RefreshCw,
    imageAlt: "Multi-device sync",
    reverse: true,
  },
];


// ------- Features Page Component -------
export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-4 sm:mb-6">
                  Achieve Your Fitness Goals with FitHome&apos;s{" "}
                  <span className="text-gradient-green">Powerful Features</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0">
                  FitHome offers a suite of features designed to help you get in the best shape of your life. Tailored workouts, progress tracking, and motivation—all at your fingertips.
                </p>
              </div>

              {}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative flex justify-center lg:justify-end order-1 lg:order-2"
              >
                <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px]">
                  {}
                  <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center">
                    <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                  </div>
                  
                  {}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] sm:rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
                      <div className="aspect-[9/16] bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4">
                        {}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                              <span className="text-white text-[8px] sm:text-xs font-bold">FH</span>
                            </div>
                            <span className="font-semibold text-xs sm:text-sm">FitHome</span>
                          </div>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200" />
                        </div>
                        
                        {}
                        <div className="bg-primary/10 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4">
                          <p className="text-[10px] sm:text-xs text-primary font-medium flex items-center gap-1">
                            <User className="w-3 h-3" /> Hi Talha Jailvajr
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">Ready for today&apos;s workout?</p>
                          <div className="flex items-center gap-3 sm:gap-4 mt-2">
                            <span className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" /> 45 min
                            </span>
                            <div className="text-[10px] sm:text-xs">
                              <span className="text-text-muted">Progress</span>
                              <span className="ml-1 font-semibold text-primary">65%</span>
                            </div>
                          </div>
                        </div>
                        
                        {}
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm h-8 sm:h-10 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                          Start Workout
                        </Button>
                        
                        {}
                        <div className="text-center">
                          <p className="text-[10px] sm:text-xs text-text-muted">Partners</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {}
          <div className="absolute inset-0 gym-pattern pointer-events-none" />
        </section>

        {}
        <section className="py-12 sm:py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {featureCards.map((feature, index) => (
                <motion.div 
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${feature.reverse ? "lg:flex-row-reverse" : ""}`}
                >
                  {}
                  <div className={`text-center lg:text-left ${feature.reverse ? "lg:order-2" : "lg:order-1"}`}>
                    <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0">
                      {feature.description}
                    </p>
                  </div>
                  
                  {}
                  <div className={`${feature.reverse ? "lg:order-1" : "lg:order-2"}`}>
                    {feature.badges ? (
                      
                      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                        {feature.badges.map((badge, badgeIndex) => {
                          const BadgeIcon = badge.icon;
                          return (
                          <motion.div 
                            key={badgeIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: badgeIndex * 0.1 }}
                            className="bg-card rounded-xl p-3 sm:p-4 border border-border shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] text-center"
                          >
                            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                              <BadgeIcon className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="font-semibold text-xs sm:text-sm text-foreground">{badge.title}</h4>
                            <p className="text-[10px] sm:text-xs text-text-muted mt-1">{badge.subtitle}</p>
                          </motion.div>
                        );
                        })}
                      </div>
                    ) : (
                      
                      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-lg">
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                          {feature.featureIcon && <feature.featureIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary/60" />}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {}
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
