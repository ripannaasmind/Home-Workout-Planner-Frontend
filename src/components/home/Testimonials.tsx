"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
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
    <div className="relative shrink-0 w-72 sm:w-80 h-52 bg-white dark:bg-card border border-border rounded-2xl p-5 mx-3 select-none group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <Quote className="absolute top-4 right-4 w-7 h-7 text-primary/10 group-hover:text-primary/25 transition-colors" />
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
      <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-4 min-h-21">
        &ldquo;{t.comment}&rdquo;
      </p>
    </div>
  );
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [perView, setPerView] = useState(3);
  const touchStartX = useRef(0);

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

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 640) setPerView(1);
      else if (window.innerWidth < 1024) setPerView(2);
      else setPerView(3);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalPages = useMemo(() => {
    if (testimonials.length === 0) return 1;
    return Math.ceil(testimonials.length / perView);
  }, [testimonials.length, perView]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentPage((p) => (p + 1) % totalPages);
    }, 3800);
    return () => clearInterval(timer);
  }, [totalPages]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  const goPrev = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);
  const goNext = () => setCurrentPage((p) => (p + 1) % totalPages);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 45) goPrev();
    if (delta < -45) goNext();
  };

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

      {/* Rows */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {testimonials.length > perView && (
            <>
              <button
                onClick={goPrev}
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-card border border-gray-200 dark:border-gray-700 shadow hover:bg-primary hover:text-white"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-card border border-gray-200 dark:border-gray-700 shadow hover:bg-primary hover:text-white"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                const pageItems = testimonials.slice(pageIndex * perView, pageIndex * perView + perView);
                return (
                  <div key={pageIndex} className="w-full shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pageItems.map((item) => (
                        <TestimonialCard key={item._id || String(item.id)} t={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentPage ? "w-6 bg-primary" : "w-2 bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to testimonials page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
