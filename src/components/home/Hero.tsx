"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Flame, Dumbbell, User } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
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
                className="font-medium px-5 sm:px-6 h-11 sm:h-12 rounded-full border-2 text-sm sm:text-base w-full sm:w-auto"
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
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px]">
              {}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] transform rotate-3 scale-105" />
              
              {}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {}
                  <div className="aspect-[9/19] bg-gradient-to-b from-gray-50 to-white p-4">
                    {}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">FH</span>
                        </div>
                        <span className="font-semibold text-sm">FitHome</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                    </div>
                    
                    {}
                    <div className="bg-primary/10 rounded-xl p-3 mb-4">
                      <p className="text-xs text-primary font-medium flex items-center gap-1">
                        <User className="w-3 h-3" /> Hi Talha
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-1">Ready for today&apos;s workout?</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-text-muted">45 min</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-text-muted">Progress</span>
                          <span className="ml-1 font-semibold text-primary">65%</span>
                        </div>
                      </div>
                    </div>
                    
                    {}
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white text-sm h-10 rounded-xl mb-4">
                      Start Workout
                    </Button>
                    
                    {}
                    <div className="bg-gray-100 rounded-xl p-3">
                      <p className="text-xs text-text-muted mb-2">Upcoming Session</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Dumbbell className="text-primary w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Upper Body Strength</p>
                          <p className="text-xs text-text-muted">60 min • Beginner</p>
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 w-48 h-64 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Dumbbell className="w-16 h-16 text-primary" />
                </div>
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
