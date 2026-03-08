"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Dumbbell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { sessionsApi, WorkoutSession, Workout } from "@/services/api";

function getWorkoutName(workout: string | Workout | undefined): string {
  if (!workout || typeof workout === "string") return "Workout";
  return (workout as Workout).name || "Workout";
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

const statusSubtitle: Record<string, string> = {
  completed: "Workout Completed",
  in_progress: "Session In Progress",
  paused: "Session Paused",
  cancelled: "Session Cancelled",
};

export function RecentActivity() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    sessionsApi
      .getAll(token)
      .then((res) => {
        if (res.success && res.data) setSessions(res.data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Recent Activity</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <Dumbbell className="w-8 h-8 text-gray-200 mb-1" />
          <p className="text-xs text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session._id} className="flex items-start gap-3">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", "bg-green-100")}>
                <Dumbbell className={cn("h-5 w-5", "text-green-700")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {getWorkoutName(session.workout as string | Workout)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {statusSubtitle[session.status] || session.status}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeDate(session.startTime)}</p>
                <a
                  href="/dashboard/workouts"
                  className="text-xs text-gray-400 hover:text-primary flex items-center gap-0.5 mt-0.5 transition-colors"
                >
                  View Details
                  <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
