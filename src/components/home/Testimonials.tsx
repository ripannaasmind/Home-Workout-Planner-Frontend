"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Quote, Loader2 } from "lucide-react";
import { testimonialsApi } from "@/services/api";

interface Testimonial {
  _id?: string;
  id?: number;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  comment: string;
  size: "small" | "medium" | "large";
}

// Fallback data in case API is unavailable
const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Nutrition Coach",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    comment: "FitHome has completely transformed my fitness routine. The personalized workouts are amazing and the progress tracking keeps me accountable. I've lost 15 pounds in just 3 months!",
    size: "large",
  },
  {
    id: 2,
    name: "Mark Andersen",
    role: "Sales Manager",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    comment: "I love how easy it is to track my progress. The app keeps me motivated every day.",
    size: "small",
  },
  {
    id: 3,
    name: "Laura Simmons",
    role: "Registered Nurse",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    comment: "Best fitness app I've ever used. The variety of workouts is incredible!",
    size: "small",
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Software Engineer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    comment: "As someone who works from home, staying active was a challenge. FitHome's quick workouts fit perfectly into my schedule. The AI recommendations are spot on!",
    size: "medium",
  },
  {
    id: 5,
    name: "Emily Chen",
    role: "Yoga Instructor",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    comment: "The workout plans are well-designed and effective. Highly recommend!",
    size: "small",
  },
  {
    id: 6,
    name: "David Brown",
    role: "Personal Trainer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    comment: "I recommend FitHome to all my clients. The exercise library is comprehensive and the form videos are excellent. It's like having a virtual trainer in your pocket.",
    size: "large",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await testimonialsApi.getAll();
        if (response.success && response.data && response.data.length > 0) {
          setTestimonials(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        // Keep fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Loved by thousands of fitness enthusiasts
          </h2>
          
          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      i < 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400/50 fill-yellow-400/50"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg sm:text-xl text-foreground">4.8</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <p className="text-text-secondary text-xs sm:text-sm md:text-base">
              10k+ people use FitHome to stay fit, motivated
            </p>
          </div>
        </div>

        {/* Bento Grid Testimonials */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 auto-rows-fr">
          {testimonials.map((testimonial) => {
            const sizeClasses = {
              small: "lg:col-span-1 lg:row-span-1",
              medium: "sm:col-span-2 lg:col-span-2 lg:row-span-1",
              large: "sm:col-span-2 lg:col-span-2 lg:row-span-1",
            };

            return (
              <div
                key={testimonial._id || testimonial.id}
                className={`relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group overflow-hidden ${sizeClasses[testimonial.size]}`}
              >
                {/* Quote Icon */}
                <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-text-muted">{testimonial.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-2 sm:mb-3">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Comment */}
                <p className={`text-text-secondary leading-relaxed ${
                  testimonial.size === "small" 
                    ? "text-xs sm:text-sm line-clamp-3" 
                    : testimonial.size === "medium"
                    ? "text-xs sm:text-sm md:text-base line-clamp-4"
                    : "text-xs sm:text-sm md:text-base"
                }`}>
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
