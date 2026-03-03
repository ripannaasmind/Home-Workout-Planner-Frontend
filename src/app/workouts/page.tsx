"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTA } from "@/components/home/CTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Dumbbell, Activity, Heart, Flame, Zap, Target, Loader2 } from "lucide-react";
import { workoutsApi } from "@/services/api";

// Icon mapping for workout types
const getWorkoutIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("strength") || lower.includes("body")) return Dumbbell;
  if (lower.includes("yoga")) return Heart;
  if (lower.includes("cardio") || lower.includes("hiit")) return Activity;
  if (lower.includes("burn") || lower.includes("fire")) return Flame;
  if (lower.includes("power") || lower.includes("energy")) return Zap;
  return Target;
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

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

interface WorkoutData {
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

const fallbackWorkouts: WorkoutData[] = [
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
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: 3,
    title: "Muscle Building",
    duration: "45 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: 4,
    title: "HIIT Burn",
    duration: "20 min",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    color: "from-red-400 to-red-600",
  },
];

const fallbackPrograms: WorkoutData[] = [
  {
    id: 1,
    title: "Weight Loss",
    duration: "20 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop",
    color: "from-green-400 to-green-600",
  },
  {
    id: 2,
    title: "Strength Training",
    duration: "60 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: 3,
    title: "Muscle Gain",
    duration: "20 min",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: 4,
    title: "Legs & Glutes",
    duration: "20 min",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop",
    color: "from-pink-400 to-pink-600",
  },
];

function getLevelColor(level: string) {
  const l = level?.toLowerCase();
  switch (l) {
    case "beginner":
      return "bg-green-100 text-green-700 border-green-200";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "advanced":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>(fallbackWorkouts);
  const [popularPrograms, setPopularPrograms] = useState<WorkoutData[]>(fallbackPrograms);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");

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
            "from-red-400 to-red-600",
            "from-green-400 to-green-600",
            "from-pink-400 to-pink-600",
          ];
          const mapped = response.data.map((w, i) => ({
            ...w,
            title: w.name,
            level: w.difficulty || "Beginner",
            duration: typeof w.duration === "number" ? `${w.duration} min` : String(w.duration),
            color: colors[i % colors.length],
          }));
          setWorkouts(mapped.slice(0, 4));
          setPopularPrograms(mapped.slice(4, 8).length > 0 ? mapped.slice(4, 8) : fallbackPrograms);
        }
      } catch (error) {
        console.error("Failed to fetch workouts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const filteredWorkouts = useMemo(() => {
    let filtered = activeLevel === "All" 
      ? [...workouts] 
      : workouts.filter(w => {
          const level = (w.level || w.difficulty || "").toLowerCase();
          return level === activeLevel.toLowerCase();
        });

    // Sort workouts
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""));
        break;
      case "duration":
        filtered.sort((a, b) => {
          const durationA = parseInt(String(a.duration)) || 0;
          const durationB = parseInt(String(b.duration)) || 0;
          return durationA - durationB;
        });
        break;
      case "newest":
        filtered.reverse();
        break;
      default: // popularity
        break;
    }

    return filtered;
  }, [workouts, activeLevel, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-10 sm:py-14 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Left Content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-3 sm:mb-4">
                  Find Your Perfect Workout
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0">
                  Browse a variety of expertly crafted workouts designed to help you reach your fitness goals. Whether you&apos;re a beginner or advanced, FitHome has something for everyone.
                </p>
              </motion.div>

              {/* Right Decorative */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:flex justify-end"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-10 h-10 text-primary" />
                  </div>
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <Activity className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute inset-0 gym-pattern pointer-events-none" />
        </section>

        {/* Filters Section */}
        <section className="py-6 sm:py-8 bg-background border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              {/* Level Tabs */}
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={activeLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLevel(level)}
                    className={`text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 ${
                      activeLevel === level 
                        ? "bg-primary hover:bg-primary-dark text-white" 
                        : "hover:bg-primary/10"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-text-muted whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] sm:w-[160px] h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Workout Cards Grid */}
        <section className="py-8 sm:py-10 lg:py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredWorkouts.map((workout, index) => {
                return (
                <motion.div
                  key={workout._id || workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 card-hover group"
                >
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
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 truncate">
                      {workout.title || workout.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                      <span>{workout.duration}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${getLevelColor(workout.level || workout.difficulty || "")}`}
                      >
                        {workout.level || workout.difficulty}
                      </Badge>
                    </div>
                    <Link href={`/workouts/${workout._id}`}>
                      <Button className="w-full bg-primary hover:bg-primary-dark text-white text-xs h-8 sm:h-9">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
              })}
            </div>
            )}
          </div>
        </section>

        {/* Popular Programs Section */}
        <section className="py-10 sm:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Popular Programs
              </h2>
              <Button variant="ghost" className="text-primary hover:text-primary-dark text-xs sm:text-sm gap-1">
                See All Programs
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Programs Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
              {popularPrograms.map((program, index) => {
                return (
                <motion.div
                  key={program._id || program.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[260px] bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 card-hover group"
                >
                  {/* Image */}
                  <div className={`aspect-[4/3] bg-gradient-to-br ${program.color} flex items-center justify-center relative overflow-hidden`}>
                    <Image
                      src={program.image && program.image.startsWith("http") ? program.image : getFallbackImage(program.title || program.name || "")}
                      alt={program.title || program.name || "Program"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 truncate">
                      {program.title || program.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                      <span>{program.duration}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${getLevelColor(program.level || program.difficulty || "")}`}
                      >
                        {program.level || program.difficulty}
                      </Badge>
                    </div>
                    <Link href={`/workouts/${program._id}`}>
                      <Button className="w-full bg-primary hover:bg-primary-dark text-white text-xs h-8">
                        View Plan
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTA 
          title="Start Your Fitness Journey Today"
          description="Download FitHome and access a variety of workouts. Achieve your fitness goals with personalized plans."
        />
      </main>
      <Footer />
    </div>
  );
}
