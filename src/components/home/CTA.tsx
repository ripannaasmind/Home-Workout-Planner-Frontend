"use client";

import { Button } from "@/components/ui/button";
import { Apple, Play } from "lucide-react";

interface CTAProps {
  title?: string;
  description?: string;
  variant?: "default" | "dark";
}

export function CTA({ 
  title = "Get Started with FitHome Today!", 
  description = "Take the first step towards a healthier and fitter you. Download FitHome now and Start your fitness journey.",
  variant = "default"
}: CTAProps) {
  const isDark = variant === "dark";
  
  return (
    <section className={`py-12 sm:py-16 lg:py-20 ${isDark ? "bg-gray-900" : "bg-primary/5"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${isDark ? "text-white" : "text-foreground"}`}>
            {title}
          </h2>
          <p className={`text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 ${isDark ? "text-gray-300" : "text-text-secondary"}`}>
            {description}
          </p>
          
          {}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white h-12 sm:h-14 px-6 sm:px-8 rounded-xl gap-3 text-sm sm:text-base"
            >
              <Apple className="h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-left">
                <div className="text-[10px] sm:text-xs opacity-80">Download on the</div>
                <div className="font-semibold text-sm sm:text-base -mt-0.5">App Store</div>
              </div>
            </Button>
            
            <Button 
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white h-12 sm:h-14 px-6 sm:px-8 rounded-xl gap-3 text-sm sm:text-base"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
              <div className="text-left">
                <div className="text-[10px] sm:text-xs opacity-80">Get it on</div>
                <div className="font-semibold text-sm sm:text-base -mt-0.5">Google Play</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
