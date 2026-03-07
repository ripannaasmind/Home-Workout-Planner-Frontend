"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const upcomingWorkouts = [
  {
    id: "1",
    title: "HIIT Burn",
    date: "Apr 25",
    time: "9:00 AM",
    duration: 40,
    difficulty: "Intermediate" as const,
    gradient: "from-gray-700 via-gray-600 to-gray-800",
  },
  {
    id: "2",
    title: "Strength Training",
    date: "Apr 26",
    time: "7:00 AM",
    duration: 50,
    difficulty: "Advanced" as const,
    gradient: "from-green-800 via-green-700 to-green-900",
  },
  {
    id: "3",
    title: "Morning Yoga",
    date: "Apr 27",
    time: "6:30 AM",
    duration: 30,
    difficulty: "Beginner" as const,
    gradient: "from-teal-700 via-teal-600 to-teal-800",
  },
];

export function UpcomingWorkout() {
  const [active, setActive] = useState(0);
  const workout = upcomingWorkouts[active];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <h3 className="text-base font-semibold text-gray-800 px-5 pt-5 pb-3">Upcoming Workouts</h3>

      <div className="mx-5 rounded-xl overflow-hidden relative">
        <div
          className={`h-52 w-full bg-gradient-to-br ${workout.gradient} flex items-end`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white/20" />
            </div>
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow">
              {workout.date}
            </span>
          </div>

          <div className="w-full bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8">
            <p className="text-white font-bold text-lg">{workout.title}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {workout.date} · {workout.time}
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
        {upcomingWorkouts.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all ${
              i === active
                ? "w-4 h-2 bg-primary"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
