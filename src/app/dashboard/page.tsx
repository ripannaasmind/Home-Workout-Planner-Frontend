"use client";

import Link from "next/link";
import { DashboardStats } from "@/features/dashboard";
import { WorkoutList } from "@/features/workouts";

export default function DashboardPage() {
  const stats = [
    { label: "Total Workouts", value: "--", color: "text-blue-400" },
    { label: "Completed", value: "--", color: "text-green-400" },
    { label: "This Week", value: "--", color: "text-purple-400" },
    { label: "Streak", value: "--", color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your fitness journey</p>
        </div>
        <Link
          href="/dashboard/workouts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Workout
        </Link>
      </div>

      <DashboardStats stats={stats} />

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Workouts</h2>
        <WorkoutList />
      </div>
    </div>
  );
}
