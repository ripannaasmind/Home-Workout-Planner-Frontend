"use client";

import { useState, useEffect } from "react";
import { Users, Dumbbell, Activity, ShoppingBag, CheckCircle, TrendingUp } from "lucide-react";
import { adminApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface DashStats {
  totalUsers: number;
  totalWorkouts: number;
  totalSessions: number;
  activeSubscriptions: number;
  newUsersLast7Days: number;
}

const statConfig = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "bg-blue-50 text-blue-600" },
  { key: "totalWorkouts", label: "Workouts", icon: Dumbbell, color: "bg-purple-50 text-purple-600" },
  { key: "totalSessions", label: "Sessions Completed", icon: Activity, color: "bg-green-50 text-green-600" },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: ShoppingBag, color: "bg-orange-50 text-orange-600" },
  { key: "newUsersLast7Days", label: "New Users (7 days)", icon: TrendingUp, color: "bg-pink-50 text-pink-600" },
] as const;


// ------- Admin Dashboard Component -------
export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi.getDashboard(token)
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your entire platform</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {statConfig.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.[key] ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/users", label: "Manage Users", icon: Users },
            { href: "/admin/workouts", label: "Manage Workouts", icon: Dumbbell },
            { href: "/admin/exercises", label: "Manage Exercises", icon: Activity },
            { href: "/admin/products", label: "Manage Products", icon: ShoppingBag },
          ].map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
