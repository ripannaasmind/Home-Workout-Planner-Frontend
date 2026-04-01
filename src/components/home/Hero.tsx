"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-emerald-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-130 lg:min-h-155">

          {/* ── Left: Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 py-12 lg:py-16 text-center lg:text-left order-2 lg:order-1"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              Personalized Workouts,{" "}
              <span className="text-gradient-green">Anytime, Anywhere</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto lg:mx-0">
              Your personal fitness companion—get fit at your pace with customized workouts that fit your lifestyle.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 h-12 rounded-full text-sm sm:text-base"
              >
                Download App
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold px-6 h-12 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white text-sm sm:text-base"
              >
                Learn More
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white bg-primary/20 overflow-hidden"
                  >
                    <Image
                      src="/Images/placeholder-avatar.svg"
                      alt="user"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">5M+ downloads</span>
            </div>

            {/* Store Rating Cards */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <Image src="/Images/App_Store_(iOS).svg.png" alt="App Store" width={28} height={28} />
                <span className="text-sm font-medium text-gray-700">App Store</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-foreground">4.8</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <Image src="/Images/google_play.png" alt="Google Play" width={28} height={28} />
                <span className="text-sm font-medium text-gray-700">Google Play</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-foreground">4.9</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Hero Image ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative w-full h-100 sm:h-125 lg:h-155">
              <Image
                src="/hero.png"
                alt="FitHome Workout"
                fill
                unoptimized
                className="object-contain object-bottom"
                priority
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
