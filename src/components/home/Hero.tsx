"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-130 lg:min-h-155 grid grid-cols-1 lg:grid-cols-2">

          {/* ── Left: Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center gap-5 py-12 lg:py-16 order-2 lg:order-1 z-10"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold leading-tight text-gray-900 dark:text-white">
              Personalized Workouts,{" "}
              <span className="text-gradient-green">Anytime, Anywhere</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-sm">
              Your personal fitness companion—get fit at your pace with customized workouts that fit your lifestyle.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 h-11 rounded-full text-sm"
              >
                Download App
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white dark:bg-gray-800 font-semibold px-6 h-11 rounded-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm shadow-sm"
              >
                Learn More
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "https://i.pravatar.cc/40?img=11",
                  "https://i.pravatar.cc/40?img=47",
                  "https://i.pravatar.cc/40?img=32",
                  "https://i.pravatar.cc/40?img=56",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt="user"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">5M+ downloads</span>
            </div>

            {/* Store Rating Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-white/60 dark:border-gray-700">
                <Image src="/Images/App_Store_(iOS).svg.png" alt="App Store" width={26} height={26} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">App Store</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">4.8</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-white/60 dark:border-gray-700">
                <Image src="/Images/google_play.png" alt="Google Play" width={26} height={26} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Google Play</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">4.9</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Hero Image ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 relative min-h-64 sm:min-h-80 self-stretch"
          >
            <Image
              src="/hero-image.png"
              alt="FitHome Workout"
              fill
              unoptimized
              priority
              className="object-contain object-bottom"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
