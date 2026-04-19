"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Clock, Flame, TrendingUp, Activity, Loader2, CheckCircle, XCircle, PauseCircle, PlayCircle, Brain, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { sessionsApi, WorkoutSession, Workout } from "@/services/api";
import { cn } from "@/lib/utils";
import type { AIWorkoutLog } from "@/app/dashboard/ai-workout/page";

interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  totalCalories: number;
  averageDuration: number;
  currentStreak: number;
}

function getWorkoutName(workout: string | Workout | undefined): string {
  if (!workout || typeof workout === "string") return "Workout";
  return (workout as Workout).name || "Workout";
}

function getWorkoutCategory(workout: string | Workout | undefined): string {
  if (!workout || typeof workout === "string") return "";
  return (workout as Workout).category || "";
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(minutes?: number): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getSessionDuration(session: WorkoutSession): string {
  // If server already computed totalDuration (in minutes) use it
  if (session.totalDuration && session.totalDuration > 0) {
    return formatDuration(session.totalDuration);
  }
  // Otherwise calculate from startTime → endTime (or now for in_progress)
  try {
    const start = new Date(session.startTime).getTime();
    const end = session.endTime
      ? new Date(session.endTime).getTime()
      : session.status === "in_progress" || session.status === "paused"
      ? Date.now()
      : null;
    if (!end) return "—";
    const totalPausedMs = session.totalPausedMs ?? 0;
    const elapsedSec = Math.floor((end - start - totalPausedMs) / 1000);
    if (elapsedSec <= 0) return "—";
    return formatSeconds(elapsedSec);
  } catch {
    return "—";
  }
}

const statusConfig: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  completed: { label: "Completed", color: "bg-green-100 text-green-700", Icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700", Icon: PlayCircle },
  paused: { label: "Paused", color: "bg-blue-100 text-blue-600", Icon: PauseCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", Icon: XCircle },
};

function fmtTimeSec(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SessionsPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [tab, setTab] = useState<"sessions" | "ai">("sessions");
  const [aiLogs, setAiLogs] = useState<AIWorkoutLog[]>([]);

  const loading = !!token && sessions === null;

  useEffect(() => {
    try {
      const stored: AIWorkoutLog[] = JSON.parse(localStorage.getItem("ai_workout_logs") || "[]");
      setAiLogs(stored);
    } catch { setAiLogs([]); }
  }, []);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      sessionsApi.getAll(token),
      sessionsApi.getStats(token),
    ])
      .then(([sessRes, statsRes]) => {
        setSessions(sessRes.success && sessRes.data ? sessRes.data : []);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
      })
      .catch(() => { setSessions([]); });
  }, [token]);

  const statuses = ["all", "completed", "in_progress", "paused", "cancelled"];

  const sessionsList = sessions ?? [];
  const filtered = filter === "all"
    ? sessionsList
    : sessionsList.filter((s) => s.status === filter);

  const statCards = [
    { label: "Total Sessions", value: stats?.totalSessions ?? 0, icon: Activity, color: "bg-primary/10 text-primary" },
    { label: "Total Duration", value: formatDuration(stats?.totalDuration), icon: Clock, color: "bg-blue-100 text-blue-600" },
    { label: "Calories Burned", value: stats?.totalCalories ? `${stats.totalCalories} kcal` : "0 kcal", icon: Flame, color: "bg-orange-100 text-orange-600" },
    { label: "Current Streak", value: stats?.currentStreak ? `${stats.currentStreak} days` : "0 days", icon: TrendingUp, color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="space-y-6 page-fade">
      <DashboardHeader
        title="Workout Sessions"
        description="Track your workout history and performance"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", card.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{card.label}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setTab("sessions")}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", tab === "sessions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Dumbbell className="inline h-4 w-4 mr-1.5 align-middle" />Workout Sessions
        </button>
        <button onClick={() => setTab("ai")}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", tab === "ai" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Brain className="inline h-4 w-4 mr-1.5 align-middle" />AI Workout History
          {aiLogs.length > 0 && <Badge className="ml-1.5 h-4 text-[10px] bg-primary/20 text-primary border-0">{aiLogs.length}</Badge>}
        </button>
      </div>

      {/* Sessions tab */}
      {tab === "sessions" && (<>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all",
              filter === s
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-primary/40"
            )}
          >
            {s === "all" ? "All Sessions" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">No sessions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {filter === "all" ? "Start a workout to track your progress." : `No ${filter} sessions.`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left text-gray-400 dark:text-gray-500 font-medium px-5 py-3">Workout</th>
                    <th className="text-left text-gray-400 dark:text-gray-500 font-medium px-4 py-3">Date</th>
                    <th className="text-left text-gray-400 dark:text-gray-500 font-medium px-4 py-3">Duration</th>
                    <th className="text-left text-gray-400 dark:text-gray-500 font-medium px-4 py-3">Calories</th>
                    <th className="text-left text-gray-400 dark:text-gray-500 font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map((session) => {
                    const cfg = statusConfig[session.status] || statusConfig.cancelled;
                    const StatusIcon = cfg.Icon;
                    return (
                      <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Dumbbell className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100">
                                {getWorkoutName(session.workout as string | Workout)}
                              </p>
                              {getWorkoutCategory(session.workout as string | Workout) && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {getWorkoutCategory(session.workout as string | Workout)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(session.startTime)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                          {getSessionDuration(session)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                          {session.caloriesBurned ? `${session.caloriesBurned} kcal` : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={cn("border-0 text-xs gap-1 rounded-md", cfg.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((session) => {
                const cfg = statusConfig[session.status] || statusConfig.cancelled;
                const StatusIcon = cfg.Icon;
                return (
                  <div key={session._id} className="p-4 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                          {getWorkoutName(session.workout as string | Workout)}
                        </p>
                        <Badge className={cn("border-0 text-xs gap-1 rounded-md shrink-0", cfg.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(session.startTime)}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span><Clock className="inline h-3 w-3 mr-0.5" />{getSessionDuration(session)}</span>
                        {session.caloriesBurned && <span><Flame className="inline h-3 w-3 mr-0.5" />{session.caloriesBurned} kcal</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      </>)}

      {/* AI Workout History tab */}
      {tab === "ai" && (
        <div className="space-y-3">
          {aiLogs.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border p-12 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No AI workouts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Complete an AI-generated workout to see your history here.</p>
            </div>
          ) : (
            aiLogs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-card rounded-2xl border p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{log.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{log.difficulty} • {log.category}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span><Clock className="inline h-3 w-3 mr-0.5" />{fmtTimeSec(log.actualDuration)}</span>
                    <span><Flame className="inline h-3 w-3 mr-0.5" />~{log.estimatedCalories} cal</span>
                    <span>{new Date(log.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                  const updated = aiLogs.filter(l => l.id !== log.id);
                  setAiLogs(updated);
                  localStorage.setItem("ai_workout_logs", JSON.stringify(updated));
                }}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
