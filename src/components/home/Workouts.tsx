"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Dumbbell, Flame, Zap, Heart, Activity, Target, Loader2 } from "lucide-react";
import { workoutsApi } from "@/services/api";

// Icon mapping for workout types
const workoutIcons: Record<string, React.ElementType> = {
  strength: Dumbbell,
  yoga: Heart,
  cardio: Activity,
  upper: Dumbbell,
  core: Flame,
  hiit: Zap,
  default: Target,
};

const getWorkoutIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("strength") || lower.includes("body")) return workoutIcons.strength;
  if (lower.includes("yoga")) return workoutIcons.yoga;
  if (lower.includes("cardio") || lower.includes("run")) return workoutIcons.cardio;
  if (lower.includes("upper")) return workoutIcons.upper;
  if (lower.includes("core") || lower.includes("abs")) return workoutIcons.core;
  if (lower.includes("hiit") || lower.includes("interval")) return workoutIcons.hiit;
  return workoutIcons.default;
};

// Fallback images based on workout type
const getFallbackImage = (title: string): string => {
  const lower = (title || "").toLowerCase();
  if (lower.includes("yoga") || lower.includes("stretch") || lower.includes("flexibility")) 
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop";
  if (lower.includes("hiit") || lower.includes("cardio") || lower.includes("burn")) 
    return "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop";
  if (lower.includes("strength") || lower.includes("upper") || lower.includes("arm")) 
    return "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&h=600&fit=crop";
  if (lower.includes("leg") || lower.includes("lower") || lower.includes("glute")) 
    return "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop";
  if (lower.includes("core") || lower.includes("abs")) 
    return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop";
  if (lower.includes("full body") || lower.includes("total")) 
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop";
  return "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800&h=600&fit=crop";
};

interface Workout {
  _id?: string;
  id?: number;
  title?: string;
  name?: string;
  duration: string | number;
  level?: string;
  difficulty?: string;
  image?: string;
  color?: string;
}

const fallbackWorkouts: Workout[] = [
  {
    id: 1,
    title: "Full Body Strength",
    duration: "30 min",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    title: "Morning Yoga",
    duration: "60 min",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: 3,
    title: "Cardio",
    duration: "30 min",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: 4,
    title: "Upper Body",
    duration: "45 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop",
    color: "from-green-400 to-green-600",
  },
  {
    id: 5,
    title: "Core Workout",
    duration: "25 min",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    color: "from-red-400 to-red-600",
  },
  {
    id: 6,
    title: "HIIT Training",
    duration: "40 min",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    color: "from-yellow-400 to-yellow-600",
  },
];

export function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>(fallbackWorkouts);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  // Fetch workouts from API
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await workoutsApi.getLibrary();
        if (response.success && response.data && response.data.length > 0) {
          const colors = [
            "from-blue-400 to-blue-600",
            "from-purple-400 to-purple-600",
            "from-orange-400 to-orange-600",
            "from-green-400 to-green-600",
            "from-red-400 to-red-600",
            "from-yellow-400 to-yellow-600",
          ];
          const mapped = response.data.map((w, i) => ({
            ...w,
            title: w.name,
            level: w.difficulty || "Beginner",
            duration: typeof w.duration === "number" ? `${w.duration} min` : String(w.duration),
            color: colors[i % colors.length],
          }));
          setWorkouts(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch workouts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  // Handle responsive items to show
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 768) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, workouts.length - itemsToShow);

  // Auto-slide functionality
  useEffect(() => {
    if (isLoading || workouts.length <= itemsToShow) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [isLoading, workouts.length, itemsToShow, maxIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <section id="workouts" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Browse Popular Workouts
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm md:text-base max-w-md mx-auto">
            Discover workout routines designed by fitness experts
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        /* Carousel Container */
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="hidden sm:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border-border hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className="hidden sm:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border-border hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Workout Cards */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out gap-4"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              }}
            >
              {workouts.map((workout, index) => {
                return (
                <motion.div
                  key={workout._id || workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsToShow}% - ${(itemsToShow - 1) * 16 / itemsToShow}px)` }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 card-hover group">
                    {/* Image */}
                    <div className={`aspect-[4/3] bg-gradient-to-br ${workout.color} flex items-center justify-center relative overflow-hidden`}>
                      <Image
                        src={workout.image && workout.image.startsWith("http") ? workout.image : getFallbackImage(workout.title || workout.name || "")}
                        alt={workout.title || workout.name || "Workout"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground mb-1 sm:mb-2 truncate">
                        {workout.title || workout.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-text-muted mb-3 sm:mb-4">
                        <span>{workout.duration}</span>
                        <span>•</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] sm:text-xs ${
                            workout.level === "Beginner" || workout.level === "beginner"
                              ? "bg-green-100 text-green-700" 
                              : workout.level === "Intermediate" || workout.level === "intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {workout.level}
                        </Badge>
                      </div>
                      <Link href={`/workouts/${workout._id}`}>
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm h-8 sm:h-10">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? "w-4 sm:w-6 bg-primary" 
                    : "w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
