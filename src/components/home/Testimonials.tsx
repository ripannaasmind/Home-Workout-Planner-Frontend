"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { testimonialsApi } from "@/services/api";

interface Testimonial {
  _id?: string;
  id?: number;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  comment: string;
  size?: "small" | "medium" | "large";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="relative flex-shrink-0 w-72 sm:w-80 bg-white dark:bg-card border border-border rounded-2xl p-5 mx-3 select-none group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
      {/* top accent line */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* quote icon */}
      <Quote className="absolute top-4 right-4 w-7 h-7 text-primary/10 group-hover:text-primary/25 transition-colors" />

      {/* author */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/25 shrink-0">
          {t.avatar ? (
            <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {t.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground leading-tight">{t.name}</p>
          <p className="text-xs text-text-muted mt-0.5">{t.role}</p>
        </div>
      </div>

      <StarRating rating={t.rating} />

      <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-4">
        &ldquo;{t.comment}&rdquo;
      </p>
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
          setTestimonials(response.data);
        }
      } catch {
        // silently handle
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const mid = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, mid);
  const row2 = testimonials.slice(mid);

  return (
    <section id="testimonials" className="py-12 sm:py-16 lg:py-20 bg-background overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4">
            <Star className="w-3 h-3 fill-current" />
            Real Customer Stories
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Loved by thousands of{" "}
            <span className="text-primary">fitness enthusiasts</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400/50 fill-yellow-400/50"
                  }`}
                />
              ))}
              <span className="font-bold text-xl text-foreground ml-1">4.8</span>
            </div>
            <span className="hidden sm:block w-px h-5 bg-border" />
            <p className="text-text-secondary text-sm">
              10k+ people use FitHome to stay fit, motivated
            </p>
          </div>
        </div>
      </div>

      {/* Marquee rows */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

          {/* Row 1 — scroll left */}
          {row1.length > 0 && (
            <div className="flex overflow-hidden py-1">
              <div className="flex animate-marquee-left">
                {[...row1, ...row1, ...row1].map((t, i) => (
                  <TestimonialCard key={`r1-${i}`} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Row 2 — scroll right */}
          {row2.length > 0 && (
            <div className="flex overflow-hidden py-1">
              <div className="flex animate-marquee-right">
                {[...row2, ...row2, ...row2].map((t, i) => (
                  <TestimonialCard key={`r2-${i}`} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
