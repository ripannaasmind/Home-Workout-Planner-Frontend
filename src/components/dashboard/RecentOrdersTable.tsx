"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Dumbbell, Loader2 } from "lucide-react";
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

export function RecentOrdersTable() {
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
        if (res.success && res.data) setSessions(res.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Workout Sessions</h3>
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Dumbbell className="w-10 h-10 text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No workout sessions yet</p>
          <Link href="/dashboard/workouts" className="text-xs text-primary mt-1 hover:underline">
            Start your first workout
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">Workout</th>
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">Date</th>
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-gray-400 font-medium pb-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-gray-800">
                    {getWorkoutName(session.workout as string | Workout)}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(session.startTime)}</td>
                  <td className="py-3 pr-4">
                    <Badge
                      className={cn(
                        "border-0 text-xs rounded-md",
                        statusStyle[session.status] || statusStyle.cancelled
                      )}
                    >
                      {statusLabel[session.status] || session.status}
                    </Badge>
                  </td>
                  <td className="py-3 font-semibold text-gray-800">
                    {session.totalDuration ? `${session.totalDuration} min` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <Link
          href="/dashboard/orders"
          className="text-xs text-gray-500 hover:text-primary flex items-center gap-0.5 transition-colors"
        >
          View All Sessions <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
