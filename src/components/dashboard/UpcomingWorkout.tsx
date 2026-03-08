"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { workoutsApi, Workout } from "@/services/api";

const GRADIENTS = [
  "from-gray-700 via-gray-600 to-gray-800",
  "from-green-800 via-green-700 to-green-900",
  "from-teal-700 via-teal-600 to-teal-800",
  "from-blue-800 via-blue-700 to-blue-900",
  "from-purple-800 via-purple-700 to-purple-900",
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UpcomingWorkout() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workoutsApi.getLibrary()
      .then((res) => {
        setWorkouts(res.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center h-52">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!workouts.length) return null;

  const workout = workouts[active];
  const gradient = GRADIENTS[active % GRADIENTS.length];
  const today = new Date();
  const scheduledDate = new Date(today);
  scheduledDate.setDate(today.getDate() + active);

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 px-5 pt-5 pb-3">Upcoming Workouts</h3>

      <div className="mx-5 rounded-xl overflow-hidden relative">
        <div
          className={`h-52 w-full bg-linear-to-br ${gradient} flex items-end`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white/20" />
            </div>
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow">
              {formatDate(scheduledDate)}
            </span>
          </div>

          <div className="w-full bg-linear-to-t from-black/70 to-transparent px-4 pb-4 pt-8">
            <p className="text-white font-bold text-lg">{workout.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {workout.category}
              </span>
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {workout.duration} min
              </span>
            </div>
            <Link href="/dashboard/workouts" className="mt-3 inline-block">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-4">
                View Workout
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-3">
        {workouts.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all ${
              i === active
                ? "w-4 h-2 bg-primary"
                : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
