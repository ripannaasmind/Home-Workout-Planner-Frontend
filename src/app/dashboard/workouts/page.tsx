"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dumbbell, Search, Loader2, Play, Square, Pause, Clock, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { workoutsApi, sessionsApi, Workout, WorkoutSession } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

const difficultyBar: Record<string, string> = {
  beginner: "bg-linear-to-r from-green-400 to-emerald-500",
  intermediate: "bg-linear-to-r from-yellow-400 to-amber-500",
  advanced: "bg-linear-to-r from-red-400 to-rose-500",
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


// ------- Workouts Page Component -------
export default function WorkoutsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0); 
  const [paused, setPaused] = useState(false);
  const [starting, setStarting] = useState<string | null>(null); 
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist active session id to localStorage so that on window close/logout
  // the session stays in_progress on the server (it's calculated from startTime).
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem("fithome-active-session", activeSession._id);
    } else {
      localStorage.removeItem("fithome-active-session");
    }
  }, [activeSession]);

  // Warn user if they try to close the tab with an active session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeSession && !paused) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeSession, paused]);

  useEffect(() => {
    workoutsApi.getLibrary()
      .then((res) => setWorkouts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch today's completed sessions to hide those workouts
  useEffect(() => {
    if (!token) return;
    sessionsApi.getAll(token).then((res) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ids = new Set<string>();
      for (const s of res.data) {
        if (s.status === "completed" && new Date(s.endTime || s.updatedAt || s.startTime) >= today) {
          const wId = typeof s.workout === "object" ? (s.workout as Workout)._id : s.workout;
          if (wId) ids.add(wId as string);
        }
      }
      setCompletedTodayIds(ids);
    }).catch(() => {});
  }, [token]);

  
  useEffect(() => {
    if (!token) return;
    sessionsApi.getActive(token).then((res) => {
      if (res.data) {
        setActiveSession(res.data);
        const w = typeof res.data.workout === "object" ? res.data.workout as Workout : null;
        setActiveWorkout(w);
        const start = new Date(res.data.startTime).getTime();
        const now = Date.now();
        const totalPausedMs = res.data.totalPausedMs ?? 0;
        setElapsed(Math.floor((now - start - totalPausedMs) / 1000));
        setPaused(res.data.status === "paused");
        setTimerOpen(true);
      }
    }).catch(() => {});
  }, [token]);

  
  useEffect(() => {
    if (timerOpen && !paused) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerOpen, paused]);

  
  const categories = ["all", ...Array.from(new Set(workouts.map((w) => w.category))).sort()];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const filtered = workouts.filter((w) => {
    if (completedTodayIds.has(w._id)) return false;
    const matchSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || w.category === categoryFilter;
    const matchDiff = difficultyFilter === "all" || w.difficulty === difficultyFilter;
    return matchSearch && matchCat && matchDiff;
  });

  const handleStart = useCallback(async (workout: Workout) => {
    if (!token) { toast.error("Please log in"); return; }
    setStarting(workout._id);
    try {
      const res = await sessionsApi.start(workout._id, token);
      setActiveSession(res.data);
      setActiveWorkout(workout);
      setElapsed(0);
      setPaused(false);
      setTimerOpen(true);
      toast.success(`Started: ${workout.name}`);
    } catch (e: unknown) {
      const err = (e instanceof Error ? e : new Error("Failed to start session")) as Error & { code?: string; redirectTo?: string };
      const msg = err.message;
      const lowerMsg = msg.toLowerCase();
      const isSubscriptionError =
        err.code === "SUBSCRIPTION_REQUIRED" ||
        lowerMsg.includes("subscription required") ||
        lowerMsg.includes("premium subscription") ||
        lowerMsg.includes("premium required");

      if (isSubscriptionError) {
        toast.error("Subscription required. Please choose a plan first.");
        router.push(err.redirectTo || "/dashboard/billing");
      } else if (msg.includes("already have a session")) {
        toast.error("You already have an active session. Finish it first.");
        
        if (token) {
          sessionsApi.getActive(token).then((r) => {
            if (r.data) {
              setActiveSession(r.data);
              const w = typeof r.data.workout === "object" ? r.data.workout as Workout : null;
              setActiveWorkout(w);
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
    const calories = activeWorkout?.estimatedCalories
      ? Math.round((activeWorkout.estimatedCalories / 60) * (elapsed / 60))
      : 0;
    try {
      await sessionsApi.complete(activeSession._id, { caloriesBurned: calories }, token);
      toast.success(`Workout complete! ${formatTime(elapsed)} elapsed`);
      setTimerOpen(false);
      setActiveSession(null);
      setActiveWorkout(null);
      setElapsed(0);
      // Hide this workout for the rest of today
      if (activeSession?.workout) {
        const wId = typeof activeSession.workout === "object" ? (activeSession.workout as Workout)._id : activeSession.workout;
        if (wId) setCompletedTodayIds((prev) => new Set(prev).add(wId as string));
      }
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
    <div className="space-y-6 page-fade">
      <DashboardHeader
        title="My Workouts"
        description="Browse and start workout sessions"
      />

      {}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>

        {}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                  categoryFilter === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-primary/40"
                )}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        )}

        {}
        {!loading && (
          <div className="flex flex-wrap gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                  difficultyFilter === d
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-primary/40"
                )}
              >
                {d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {}
      {activeSession && !timerOpen && (
        <div
          className="rounded-2xl glass border-primary/20 px-4 py-3 flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200"
          onClick={() => setTimerOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm shadow-primary/30 animate-pulse">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Session in progress</p>
              <p className="text-xs text-muted-foreground">{activeWorkout?.name ?? "Workout"} — {formatTime(elapsed)}</p>
            </div>
          </div>
          <Button size="sm" className="bg-linear-to-r from-primary to-primary/80 text-white h-8 px-4 shadow-sm shadow-primary/25">Resume</Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-grid">
          {filtered.map((workout) => (
            <div
              key={workout._id}
              className="group relative rounded-2xl glass shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col"
            >
              {/* Difficulty gradient top bar */}
              <div className={cn("h-1.5 w-full", difficultyBar[workout.difficulty] ?? "bg-gray-200")} />

              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={`border-0 text-xs ${difficultyColor[workout.difficulty] ?? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}>
                    {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-snug">{workout.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{workout.category}</p>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>{workout.duration} min</span>
                  </div>
                  {workout.estimatedCalories ? (
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-400" />
                      <span>~{workout.estimatedCalories} kcal</span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{workout.exercises?.length ?? 0} exercises</span>
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full"
                      style={{ width: `${Math.min(100, ((workout.exercises?.length ?? 0) / 15) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 mt-auto">
                  <Button
                    className="w-full gap-2 bg-linear-to-r from-primary to-primary/80 text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
                    size="sm"
                    onClick={() => handleStart(workout)}
                    disabled={starting === workout._id}
                  >
                    {starting === workout._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-white group-hover:scale-110 transition-transform" />
                    )}
                    Start Workout
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">No workouts found.</div>
          )}
        </div>
      )}

      {}
      <Dialog open={timerOpen} onOpenChange={(open) => { if (!open) setTimerOpen(false); }}>
        <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{activeWorkout?.name ?? "Workout"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-4">
            {}
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

            {}
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{activeWorkout?.duration ?? 0} min target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>~{activeWorkout?.estimatedCalories ?? 0} kcal</span>
              </div>
            </div>

            {paused && (
              <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Paused</Badge>
            )}

            {}
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
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-50 dark:hover:bg-red-500/100/10 text-xs"
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
