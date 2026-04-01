"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Flame, Dumbbell } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-8 md:py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left order-2 lg:order-1"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              Personalized Workouts,{" "}
              <span className="text-gradient-green">Anytime, Anywhere</span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0">
              Your personal fitness companion—get fit at your pace with customized workouts that fit your lifestyle.
            </p>

            {}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark text-white font-medium px-5 sm:px-6 h-11 sm:h-12 rounded-full text-sm sm:text-base w-full sm:w-auto"
              >
                Download App
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="font-medium px-5 sm:px-6 h-11 sm:h-12 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white text-sm sm:text-base w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>

            {}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start mt-4">
              <div className="flex items-center gap-2">
                <Image src="/Images/App_Store_(iOS).svg.png" alt="Apple Store" width={35} height={35}/>
                   <span className="text-sm text-text-secondary font-medium">App Store</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">4.8</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? "text-yellow-400" : "text-yellow-400/50"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
             
              </div>
              
              <div className="flex items-center gap-2">
                  <Image src="/Images/google_play.png" alt="Apple Store" width={35} height={35}/>
                <span className="text-sm text-text-secondary font-medium">Google Play</span>
                <span className="text-xs text-text-muted">5M+ downloads</span>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative w-full max-w-75 sm:max-w-90 lg:max-w-105">

              {/* Glow background blob */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl scale-110 pointer-events-none" />

              {/* GIF */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Image
                  src="/Images/hero-workout.gif"
                  alt="FitHome Workout"
                  width={420}
                  height={420}
                  unoptimized
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </motion.div>

              {/* Floating stat — top left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute top-4 -left-4 sm:-left-8 z-20 bg-white dark:bg-card border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-text-muted leading-none">Calories</p>
                  <p className="text-sm font-bold text-foreground leading-tight">320 kcal</p>
                </div>
              </motion.div>

              {/* Floating stat — bottom right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute bottom-8 -right-4 sm:-right-8 z-20 bg-white dark:bg-card border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted leading-none">Workouts</p>
                  <p className="text-sm font-bold text-foreground leading-tight">12 done</p>
                </div>
              </motion.div>

              {/* Floating stat — bottom left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="absolute bottom-4 left-0 sm:-left-4 z-20 bg-primary rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-white fill-white" />
                <p className="text-xs font-semibold text-white whitespace-nowrap">Today&apos;s Session</p>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
      
      {}
      <div className="absolute inset-0 gym-pattern pointer-events-none" />
    </section>
  );
}
