"use client";

import { Dumbbell, BookOpen, ShoppingBag, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatCards } from "@/components/dashboard/StatCards";
import { UpcomingWorkout } from "@/components/dashboard/UpcomingWorkout";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { RecommendedForYouList } from "@/components/dashboard/RecommendedForYouList";
import { RecentOrdersGrid } from "@/components/dashboard/RecentOrdersGrid";
import { RecommendedForYouGrid } from "@/components/dashboard/RecommendedForYouGrid";

const stats = [
  { label: "Workouts Completed", value: 12, icon: Dumbbell },
  { label: "Active Programs", value: 2, icon: BookOpen },
  { label: "Orders Placed", value: 5, icon: ShoppingBag },
  { label: "Total Spend", value: "$299.00", icon: DollarSign },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <h2 className="text-base font-semibold text-gray-700 mt-0.5">
            Welcome back, {user?.name ?? "User"}!
          </h2>
          <p className="text-gray-400 text-sm">Here&apos;s a quick overview of your fitness journey.</p>
        </div>

        {/* Profile card — visible only on small screens (right panel hidden on < lg) */}
        <div className="lg:hidden">
          <UserProfileCard />
        </div>

        {/* Stats 2×2 grid */}
        <StatCards stats={stats} />

        {/* Upcoming Workout carousel card */}
        <UpcomingWorkout />

        {/* Recent Orders table */}
        <RecentOrdersTable />

        {/* Bottom 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentOrdersGrid />
          <RecommendedForYouGrid />
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-col w-72 shrink-0 space-y-4">
        <UserProfileCard />
        <RecentActivity />
        <RecommendedForYouList />
      </div>
    </div>
  );
}
