"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { sessionsApi, WorkoutSession, Workout } from "@/services/api";

const statusStyle: Record<string, string> = {
  completed: "bg-green-100 text-green-700 hover:bg-green-100",
  in_progress: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  paused: "bg-blue-100 text-blue-600 hover:bg-blue-100",
  cancelled: "bg-gray-100 text-gray-500 hover:bg-gray-100",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  paused: "Paused",
  cancelled: "Cancelled",
};

function getWorkoutName(workout: string | Workout | undefined): string {
  if (!workout || typeof workout === "string") return "Workout";
  return (workout as Workout).name || "Workout";
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function RecentOrdersGrid() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const loading = !!token && sessions === null;
  const sessionsList = sessions ?? [];

  useEffect(() => {
    if (!token) return;
    sessionsApi
      .getAll(token)
      .then((res) => {
        setSessions(res.success && res.data ? res.data.slice(0, 3) : []);
      })
      .catch(() => { setSessions([]); });
  }, [token]);

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Sessions</h3>
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : sessionsList.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Dumbbell className="w-8 h-8 text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No sessions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessionsList.map((session) => (
            <div
              key={session._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {getWorkoutName(session.workout as string | Workout)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(session.startTime)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {session.totalDuration ? `${session.totalDuration} min` : "—"}
                </p>
                <Badge
                  className={cn(
                    "border-0 text-xs mt-1",
                    statusStyle[session.status] || statusStyle.cancelled
                  )}
                >
                  {statusLabel[session.status] || session.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 text-right">
        <Link href="/dashboard/orders" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
          View All
        </Link>
      </div>
    </div>
  );
}
