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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await testimonialsApi.getAll();
        if (response.success && response.data && response.data.length > 0) {
          const sizes: Testimonial["size"][] = ["large", "small", "small", "medium", "small", "large"];
          const mapped = response.data.map((t, i) => ({
            ...t,
            size: t.size || sizes[i % sizes.length],
          }));
          setTestimonials(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Loved by thousands of fitness enthusiasts
          </h2>
          
          {}
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

        {}
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
                {}
                <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

                {}
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

                {}
                <div className="mb-2 sm:mb-3">
                  <StarRating rating={testimonial.rating} />
                </div>

                {}
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
