"use client";

import { useState, useEffect } from "react";
import { Dumbbell, BookOpen, ShoppingBag, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, productsApi } from "@/services/api";
import { StatCards } from "@/components/dashboard/StatCards";
import { UpcomingWorkout } from "@/components/dashboard/UpcomingWorkout";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { RecommendedForYouList } from "@/components/dashboard/RecommendedForYouList";
import { RecentOrdersGrid } from "@/components/dashboard/RecentOrdersGrid";
import { RecommendedForYouGrid } from "@/components/dashboard/RecommendedForYouGrid";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState([
    { label: "Workouts Completed", value: 0 as number | string, icon: Dumbbell },
    { label: "Active Minutes", value: 0 as number | string, icon: BookOpen },
    { label: "Calories Burned", value: 0 as number | string, icon: Flame },
    { label: "Current Streak", value: 0 as number | string, icon: ShoppingBag },
  ]);
  const [quote, setQuote] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState<Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    iconBg: string;
    icon: React.ElementType;
    iconColor: string;
  }>>([]);

  useEffect(() => {
    if (!token) return;

    dashboardApi.getData(token).then((res) => {
      const d = res.data;
      setStats([
        { label: "Workouts Completed", value: d.weeklyProgress.workoutsCompleted, icon: Dumbbell },
        { label: "Active Minutes", value: d.weeklyProgress.activeMinutes, icon: BookOpen },
        { label: "Calories Burned", value: d.weeklyProgress.totalCalories, icon: Flame },
        { label: "Current Streak", value: d.currentStreak, icon: ShoppingBag },
      ]);
      setQuote(d.quoteOfTheDay);
    }).catch(() => {});

    productsApi.getAll({ limit: 4 }).then((res) => {
      setRecommendedProducts(
        res.data.map((p) => ({
          id: p._id || p.id || "",
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          iconBg: "bg-gray-100",
          icon: ShoppingBag,
          iconColor: "text-gray-600",
        }))
      );
    }).catch(() => {});
  }, [token]);

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
          <p className="text-gray-400 text-sm">
            {quote || "Here's a quick overview of your fitness journey."}
          </p>
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
          <RecommendedForYouGrid products={recommendedProducts} />
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-col w-72 shrink-0 space-y-4">
        <UserProfileCard />
        <RecentActivity />
        <RecommendedForYouList products={recommendedProducts.slice(0, 2).map(p => ({ ...p, type: "cart" as const }))} />
      </div>
    </div>
  );
}
