"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTA } from "@/components/home/CTA";
import { Star, Dumbbell, Activity, Loader2, User } from "lucide-react";
import { testimonialsApi } from "@/services/api";

interface Testimonial {
  _id?: string;
  id?: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  role?: string;
}



function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonialList, setTestimonialList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await testimonialsApi.getAll();
        if (response.data && response.data.length > 0) {
          setTestimonialList(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Split testimonials into two columns for masonry effect
  const leftColumn = testimonialList.filter((_, i) => i % 2 === 0);
  const rightColumn = testimonialList.filter((_, i) => i % 2 === 1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-primary/5 py-10 sm:py-14 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-3 sm:mb-4">
                  See Why Users Love FitHome
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 mb-6">
                  FitHome has helped thousands of people achieve their <strong>fitness</strong> goals. Read what our satisfied users have to say about their journey and results.
                </p>

                {/* Rating Summary */}
                <div className="flex items-center gap-3 justify-center lg:justify-start">
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
                  <span className="text-xs sm:text-sm text-text-muted">Based on 10,000+ satisfied users</span>
                </div>
              </div>

              {/* Right Decorative */}
              <div className="hidden lg:flex justify-end">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-10 h-10 text-primary" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="absolute inset-0 gym-pattern pointer-events-none" />
        </section>

        {/* Testimonials Grid */}
        <section className="py-10 sm:py-12 lg:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Mobile: Single Column, Tablet+: Two Column Masonry */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4 sm:space-y-6">
                    {leftColumn.map((testimonial, index) => (
                      <motion.div
                        key={testimonial._id || String(testimonial.id) || String(index)}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <TestimonialCard testimonial={testimonial} />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4 sm:space-y-6 sm:mt-8 lg:mt-12">
                    {rightColumn.map((testimonial, index) => (
                      <motion.div
                        key={testimonial._id || String(testimonial.id) || String(index)}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <TestimonialCard testimonial={testimonial} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mobile: Single Column */}
                <div className="sm:hidden space-y-4">
                  {testimonialList.map((testimonial, index) => (
                    <motion.div
                      key={testimonial._id || String(testimonial.id) || String(index)}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <TestimonialCard testimonial={testimonial} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === 0 ? "bg-primary w-4" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTA 
          title="Join the FitHome community and achieve your fitness goals!"
          description="Start your fitness journey today—download FitHome and see the results for yourself!"
        />
      </main>
      <Footer />
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300">
      {/* Avatar and Name */}
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              className="object-cover"
            />
          ) : (
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm sm:text-base text-foreground">{testimonial.name}</h4>
          {testimonial.role && (
            <p className="text-xs text-text-muted">{testimonial.role}</p>
          )}
          <StarRating rating={testimonial.rating} />
        </div>
      </div>

      {/* Comment */}
      <p className="text-xs sm:text-sm lg:text-base text-text-secondary leading-relaxed">
        {testimonial.comment}
      </p>
    </div>
  );
}
