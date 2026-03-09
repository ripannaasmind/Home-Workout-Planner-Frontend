"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTA } from "@/components/home/CTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight, Dumbbell, Activity, Loader2, Play, Square, Pause, Clock, Flame } from "lucide-react";
import { workoutsApi, sessionsApi, WorkoutSession, Workout } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";



const getFallbackImage = (title: string): string => {
  const lower = (title || "").toLowerCase();
  if (lower.includes("yoga") || lower.includes("stretch") || lower.includes("flexibility")) 
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop";
  if (lower.includes("hiit") || lower.includes("cardio") || lower.includes("burn")) 
    return "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop";
  if (lower.includes("strength") || lower.includes("upper") || lower.includes("arm")) 
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop";
  if (lower.includes("leg") || lower.includes("lower") || lower.includes("glute")) 
    return "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop";
  if (lower.includes("core") || lower.includes("abs")) 
    return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop";
  if (lower.includes("full body") || lower.includes("total")) 
    return "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800&h=600&fit=crop";
  return "/Images/placeholder.svg";
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
  category?: string;
}



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

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


// ------- Workouts Page Component -------
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [popularPrograms, setPopularPrograms] = useState<WorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session tracking
  const { token } = useAuth();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<{ id: string; name: string; duration: string | number } | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  
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
            level: w.difficulty,
            duration: typeof w.duration === "number" ? `${w.duration} min` : String(w.duration),
            color: colors[i % colors.length],
          }));
          setWorkouts(mapped);
          
          setPopularPrograms(mapped.slice(0, 6));
        }
      } catch {
        // silently handle fetch error
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  
  const availableLevels = useMemo(() => {
    const found = new Set(workouts.map((w) => (w.level || w.difficulty || "").toLowerCase()));
    return ["All", ...levels.slice(1).filter((l) => found.has(l.toLowerCase()))];
  }, [workouts]);

  const availableCategories = useMemo(() => {
    const cats = new Set(workouts.map((w) => w.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(cats).sort()];
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    const filtered = workouts.filter((w) => {
      const level = (w.level || w.difficulty || "").toLowerCase();
      const matchLevel = activeLevel === "All" || level === activeLevel.toLowerCase();
      const matchCat = activeCategory === "All" || w.category === activeCategory;
      return matchLevel && matchCat;
    });

    
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
      default: 
        break;
    }

    return filtered;
  }, [workouts, activeLevel, activeCategory, sortBy]);

  // Timer interval
  useEffect(() => {
    if (timerOpen && !paused) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerOpen, paused]);

  const handleStart = useCallback(async (workout: WorkoutData) => {
    if (!workout._id) return;
    if (!token) {
      toast.error("Please log in to start a workout");
      router.push("/login");
      return;
    }
    setStarting(workout._id);
    try {
      const res = await sessionsApi.start(workout._id, token);
      setActiveSession(res.data);
      setActiveWorkout({ id: workout._id, name: workout.title || workout.name || "Workout", duration: workout.duration });
      setElapsed(0);
      setPaused(false);
      setTimerOpen(true);
      toast.success(`Started: ${workout.title || workout.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start session";
      if (msg.includes("already have a session")) {
        toast.error("You already have an active session. Finish it first.");
        if (token) {
          sessionsApi.getActive(token).then((r) => {
            if (r.data) {
              setActiveSession(r.data);
              const w = typeof r.data.workout === "object" ? r.data.workout as Workout : null;
              setActiveWorkout(w ? { id: w._id, name: w.name, duration: w.duration } : null);
              const start = new Date(r.data.startTime).getTime();
              const totalPausedMs = r.data.totalPausedMs ?? 0;
              setElapsed(Math.floor((Date.now() - start - totalPausedMs) / 1000));
              setPaused(r.data.status === "paused");
              setTimerOpen(true);
            }
          }).catch(() => {});
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setStarting(null);
    }
  }, [token, router]);

  const handlePause = async () => {
    if (!activeSession || !token) return;
    try {
      if (paused) {
        await sessionsApi.resume(activeSession._id, token);
        setPaused(false);
        toast.success("Session resumed");
      } else {
        await sessionsApi.pause(activeSession._id, token);
        setPaused(true);
        toast.success("Session paused");
      }
    } catch {
      toast.error("Failed to update session");
    }
  };

  const handleComplete = async () => {
    if (!activeSession || !token) return;
    try {
      await sessionsApi.complete(activeSession._id, { caloriesBurned: 0 }, token);
      toast.success(`Workout complete! ${formatTime(elapsed)}`);
      setTimerOpen(false);
      setActiveSession(null);
      setActiveWorkout(null);
      setElapsed(0);
    } catch {
      toast.error("Failed to complete session");
    }
  };

  const handleCancel = async () => {
    if (!activeSession || !token) return;
    try {
      await sessionsApi.cancel(activeSession._id, token);
      toast.info("Session cancelled");
      setTimerOpen(false);
      setActiveSession(null);
      setActiveWorkout(null);
      setElapsed(0);
    } catch {
      toast.error("Failed to cancel session");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {}
        <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-primary/5 py-10 sm:py-14 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {}
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

              {}
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

        {}
        <section className="py-6 sm:py-8 bg-background border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                {}
                <div className="flex flex-wrap gap-2">
                  {availableLevels.map((level) => (
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

                {}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-text-muted whitespace-nowrap">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-35 sm:w-40 h-9 sm:h-10 text-xs sm:text-sm">
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

              {}
              {availableCategories.length > 2 && (
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                        activeCategory === cat
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {cat === "All" ? "All Categories" : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {}
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
                  className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 card-hover group"
                >
                  {}
                  <div className={`aspect-4/3 bg-linear-to-br ${workout.color} flex items-center justify-center relative overflow-hidden`}>
                    <SafeImage
                      src={workout.image && workout.image.startsWith("http") ? workout.image : getFallbackImage(workout.title || workout.name || "")}
                      alt={workout.title || workout.name || "Workout"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {}
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
                    <Button
                      className="w-full bg-primary hover:bg-primary-dark text-white text-xs h-8 sm:h-9 gap-1.5"
                      onClick={() => handleStart(workout)}
                      disabled={starting === workout._id}
                    >
                      {starting === workout._id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Play className="h-3 w-3 fill-white" />}
                      Start Workout
                    </Button>
                  </div>
                </motion.div>
              );
              })}
            </div>
            )}
          </div>
        </section>

        {}
        <section className="py-10 sm:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Popular Programs
              </h2>
              <Button variant="ghost" className="text-primary hover:bg-primary hover:text-white text-xs sm:text-sm gap-1">
                See All Programs
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {}
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin cursor-grab active:cursor-grabbing select-none"
              onMouseDown={(e) => {
                if (!sliderRef.current) return;
                isDragging.current = true;
                startX.current = e.pageX - sliderRef.current.offsetLeft;
                scrollLeft.current = sliderRef.current.scrollLeft;
              }}
              onMouseMove={(e) => {
                if (!isDragging.current || !sliderRef.current) return;
                e.preventDefault();
                const x = e.pageX - sliderRef.current.offsetLeft;
                const walk = (x - startX.current) * 1.5;
                sliderRef.current.scrollLeft = scrollLeft.current - walk;
              }}
              onMouseUp={() => { isDragging.current = false; }}
              onMouseLeave={() => { isDragging.current = false; }}
            >
              {popularPrograms.map((program, index) => {
                return (
                <motion.div
                  key={program._id || program.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="shrink-0 w-50 sm:w-55 lg:w-65 bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 card-hover group"
                >
                  {}
                  <div className={`aspect-4/3 bg-linear-to-br ${program.color} flex items-center justify-center relative overflow-hidden`}>
                    <SafeImage
                      src={program.image && program.image.startsWith("http") ? program.image : getFallbackImage(program.title || program.name || "")}
                      alt={program.title || program.name || "Program"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {}
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
                    <Button
                      className="w-full bg-primary hover:bg-primary-dark text-white text-xs h-8 gap-1.5"
                      onClick={() => handleStart(program)}
                      disabled={starting === program._id}
                    >
                      {starting === program._id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Play className="h-3 w-3 fill-white" />}
                      Start
                    </Button>
                  </div>
                </motion.div>
              );
              })}
            </div>
          </div>
        </section>

        {}
        <CTA 
          title="Start Your Fitness Journey Today"
          description="Download FitHome and access a variety of workouts. Achieve your fitness goals with personalized plans."
        />
      </main>
      <Footer />

      {/* Active session timer dialog */}
      <Dialog open={timerOpen} onOpenChange={(open) => { if (!open) setTimerOpen(false); }}>
        <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{activeWorkout?.name ?? "Workout"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative flex items-center justify-center">
              <div className="h-40 w-40 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <div className={cn(
                  "h-32 w-32 rounded-full border-4 flex items-center justify-center",
                  paused ? "border-yellow-400" : "border-primary animate-pulse"
                )}>
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
                    {formatTime(elapsed)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{activeWorkout?.duration ?? 0} target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>Active</span>
              </div>
            </div>
            {paused && (
              <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Paused</Badge>
            )}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-gray-200 dark:border-gray-800"
                onClick={handlePause}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleComplete}
              >
                <Square className="h-4 w-4 fill-white" />
                Complete
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 w-full"
              onClick={handleCancel}
            >
              Cancel Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
