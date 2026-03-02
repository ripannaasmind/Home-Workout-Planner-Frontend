"use client";

import Link from "next/link";
import { WorkoutList } from "@/features/workouts";

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Workouts</h1>
        <Link
          href="/dashboard/workouts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Workout
        </Link>
      </div>
      <WorkoutList />
    </div>
  );
}
