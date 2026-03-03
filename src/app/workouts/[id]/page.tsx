"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { workoutsApi, Workout, WorkoutExercise } from "@/services/api";
import {
  Play,
  Clock,
  Flame,
  Target,
  ChevronLeft,
  Dumbbell,
  CheckCircle2,
  Timer,
  RotateCcw,
  Users,
  Star,
  Heart,
  Share2,
  Loader2,
  Activity,
  Zap,
} from "lucide-react";

// YouTube video IDs for different workout categories
const getWorkoutVideo = (category: string, name: string): string => {
  const videos: Record<string, string> = {
    full_body: "UBMk30rjy0o",
    upper_body: "BkS1-El_WlE",
    lower_body: "RjexvOAsVtI",
    core: "AnYl6Nk9GOA",
    hiit: "ml6cT4AZdqI",
    cardio: "VHyGqsPOUHs",
    flexibility: "g_tea8ZNk5A",
    strength: "IODxDxX7oi4",
    default: "UBMk30rjy0o",
  };
  
  // Try to match category first
  const cat = category?.toLowerCase() || "";
  if (videos[cat]) return videos[cat];
  
  // Try to match by name keywords
  const lower = name?.toLowerCase() || "";
  if (lower.includes("hiit") || lower.includes("cardio")) return videos.hiit;
  if (lower.includes("yoga") || lower.includes("stretch") || lower.includes("flexibility")) return videos.flexibility;
  if (lower.includes("upper") || lower.includes("arm") || lower.includes("chest")) return videos.upper_body;
  if (lower.includes("lower") || lower.includes("leg") || lower.includes("glute")) return videos.lower_body;
  if (lower.includes("core") || lower.includes("abs")) return videos.core;
  if (lower.includes("strength")) return videos.strength;
  
  return videos.default;
};

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

function getCategoryIcon(category: string) {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("hiit") || cat.includes("cardio")) return Activity;
  if (cat.includes("strength") || cat.includes("upper") || cat.includes("lower")) return Dumbbell;
  if (cat.includes("flexibility") || cat.includes("yoga")) return Heart;
  if (cat.includes("core")) return Target;
  return Zap;
}

export default function WorkoutDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const response = await workoutsApi.getLibraryById(params.id as string);
        if (response.success && response.data) {
          setWorkout(response.data);
        } else {
          setError("Workout not found");
        }
      } catch (err) {
        console.error("Failed to fetch workout:", err);
        setError("Failed to load workout details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Workout Not Found</h1>
            <p className="text-text-secondary mb-4">{error || "The workout you're looking for doesn't exist."}</p>
            <Button onClick={() => router.push("/workouts")} className="bg-primary hover:bg-primary-dark text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Workouts
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(workout.category);
  const videoId = getWorkoutVideo(workout.category, workout.name);
  const totalSets = workout.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0;
  const totalReps = workout.exercises?.reduce((sum, ex) => sum + ((ex.sets || 0) * (ex.reps || 0)), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Video */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Back Button */}
          <div className="absolute top-4 left-4 z-20">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/workouts")}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 py-8 sm:py-12 lg:py-16 items-center">
              {/* Left: Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white order-2 lg:order-1"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`${getLevelColor(workout.difficulty)} text-xs`}>
                    {workout.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white text-xs">
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {workout.category?.replace("_", " ")}
                  </Badge>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {workout.name}
                </h1>
                
                <p className="text-gray-300 text-base sm:text-lg mb-6 max-w-xl">
                  {workout.description || "Transform your body with this expertly designed workout program. Follow along with our video guide and achieve your fitness goals."}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold">{workout.duration}</p>
                    <p className="text-xs text-gray-400">Minutes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-xl font-bold">{workout.estimatedCalories || Math.round(workout.duration * 8)}</p>
                    <p className="text-xs text-gray-400">Calories</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <Target className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <p className="text-xl font-bold">{workout.exercises?.length || 0}</p>
                    <p className="text-xs text-gray-400">Exercises</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <RotateCcw className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-xl font-bold">{totalSets}</p>
                    <p className="text-xs text-gray-400">Total Sets</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-white gap-2">
                    <Play className="w-5 h-5" />
                    Start Workout
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 gap-2"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    {isLiked ? "Saved" : "Save"}
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-gray-900 flex items-center justify-center text-xs text-white font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-gray-400">(2.4k reviews)</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      <Users className="w-3 h-3 inline mr-1" />
                      12,847 people completed this workout
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Right: YouTube Video */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={`${workout.name} workout video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-center text-gray-400 text-sm mt-3">
                  Watch the full workout guide
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Target Muscle Groups */}
        {workout.targetMuscleGroups && workout.targetMuscleGroups.length > 0 && (
          <section className="py-8 bg-muted/30 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Target Muscle Groups</h3>
              <div className="flex flex-wrap gap-2">
                {workout.targetMuscleGroups.map((muscle, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 capitalize">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Exercises List */}
        <section className="py-10 sm:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Workout Exercises
              </h2>
              <Badge variant="outline" className="text-sm">
                {workout.exercises?.length || 0} exercises
              </Badge>
            </div>

            <div className="grid gap-4">
              {workout.exercises && workout.exercises.length > 0 ? (
                workout.exercises.map((exerciseItem: WorkoutExercise, index: number) => {
                  const exercise = exerciseItem.exercise;
                  if (!exercise) return null;
                  
                  return (
                    <motion.div
                      key={exercise._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Exercise Number */}
                            <div className="flex sm:flex-col items-center justify-center bg-primary/10 px-4 py-3 sm:py-0 sm:w-16">
                              <span className="text-2xl font-bold text-primary">{index + 1}</span>
                            </div>
                            
                            {/* Exercise Image */}
                            <div className="relative w-full sm:w-32 h-32 sm:h-auto bg-muted shrink-0">
                              {exercise.image && exercise.image.startsWith("http") ? (
                                <Image
                                  src={exercise.image}
                                  alt={exercise.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                                  <Dumbbell className="w-10 h-10 text-primary/60" />
                                </div>
                              )}
                            </div>

                            {/* Exercise Info */}
                            <div className="flex-1 p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-foreground mb-1">
                                    {exercise.name}
                                  </h3>
                                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                    {exercise.description || `Perform this exercise with proper form to maximize results.`}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {exercise.muscleGroup && (
                                      <Badge variant="outline" className="text-xs capitalize">
                                        <Target className="w-3 h-3 mr-1" />
                                        {exercise.muscleGroup}
                                      </Badge>
                                    )}
                                    {exercise.equipment && exercise.equipment !== "none" && (
                                      <Badge variant="outline" className="text-xs capitalize">
                                        <Dumbbell className="w-3 h-3 mr-1" />
                                        {exercise.equipment}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Sets/Reps/Duration */}
                                <div className="flex gap-4 sm:gap-6 text-center shrink-0">
                                  <div>
                                    <p className="text-2xl font-bold text-primary">{exerciseItem.sets}</p>
                                    <p className="text-xs text-text-muted uppercase">Sets</p>
                                  </div>
                                  {exerciseItem.reps > 0 ? (
                                    <div>
                                      <p className="text-2xl font-bold text-foreground">{exerciseItem.reps}</p>
                                      <p className="text-xs text-text-muted uppercase">Reps</p>
                                    </div>
                                  ) : exerciseItem.duration > 0 ? (
                                    <div>
                                      <p className="text-2xl font-bold text-foreground">{exerciseItem.duration}s</p>
                                      <p className="text-xs text-text-muted uppercase">Duration</p>
                                    </div>
                                  ) : null}
                                  <div>
                                    <p className="text-2xl font-bold text-text-secondary">{exerciseItem.restTime}s</p>
                                    <p className="text-xs text-text-muted uppercase">Rest</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <Card className="p-8 text-center">
                  <Dumbbell className="w-12 h-12 mx-auto text-text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No exercises found</h3>
                  <p className="text-text-secondary">Exercise details will be added soon.</p>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-10 sm:py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Pro Tips</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Warm Up First</h4>
                    <p className="text-sm text-text-secondary">Always warm up for 5-10 minutes before starting your workout to prevent injuries.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Timer className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Rest Between Sets</h4>
                    <p className="text-sm text-text-secondary">Take the recommended rest time between sets to maximize your performance.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Stay Hydrated</h4>
                    <p className="text-sm text-text-secondary">Drink water throughout your workout to maintain energy and performance.</p>
                  </div>
                </div>
            </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-primary via-primary-dark to-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">Begin this workout now and take the first step towards achieving your fitness goals.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 gap-2">
                <Play className="w-5 h-5" />
                Start Workout
              </Button>
              <Link href="/workouts">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Browse More Workouts
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
